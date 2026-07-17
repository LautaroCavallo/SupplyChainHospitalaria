import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import { AppError } from '../../../application/errors/AppError';
import { config } from '../../../config';

export interface CoreUser {
  id: string;
  nombre: string;
  email?: string;
  rol: string;
  cargo?: string;
  permisos?: string[];
}

export interface CoreLoginResult {
  token: string;
  user: CoreUser;
}

interface CoreUserResponse {
  id?: string | number;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  role?: string;
  roles?: Array<string | { name?: string; code?: string }>;
  permissions?: Array<string | { name?: string; code?: string }>;
}

interface CoreAuthResponse {
  token?: string;
  accessToken?: string;
  access_token?: string;
  user?: CoreUserResponse;
}

// Module-level singleton — shared across all CoreAuthService instances
let _jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

export class CoreAuthService {
  private readonly baseUrl = config.integrations.coreApiUrl.replace(/\/$/, '');

  get enabled(): boolean {
    return Boolean(this.baseUrl);
  }

  private get jwksUrl(): string {
    const base = this.baseUrl || 'https://api.healthcare.cantero.ar';
    return `${base}/.well-known/jwks.json`;
  }

  private getJwks(): ReturnType<typeof createRemoteJWKSet> {
    if (!_jwks) {
      _jwks = createRemoteJWKSet(new URL(this.jwksUrl));
    }
    return _jwks;
  }

  async login(email: string, password: string): Promise<CoreLoginResult> {
    // Modo mock (solo desarrollo local sin Core disponible): usuario fijo, sin persistencia local.
    if (config.integrations.authMode !== 'core') {
      return {
        token: 'dev-token',
        user: { id: 'usr-001', nombre: 'Usuario Farmacia', email, rol: 'FARMACEUTICO_JEFE', permisos: ['farmacia:*'] },
      };
    }

    const response = await this.request<CoreAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const token = response.token ?? response.accessToken ?? response.access_token;
    if (!token) {
      throw new AppError('Core no devolvió token de autenticación', 502);
    }

    return {
      token,
      user: this.mapUser(response.user, email),
    };
  }

  /**
   * Canje de ticket SSO: intercambia el ticket de un solo uso por un JWT.
   * Se llama servidor-a-servidor; el ticket nunca queda expuesto al navegador.
   */
  async exchangeTicket(ticket: string): Promise<CoreLoginResult> {
    if (!this.enabled) {
      return {
        token: 'dev-sso-token',
        user: {
          id: 'sso-usr-001',
          nombre: 'Usuario SSO (dev)',
          rol: 'FARMACEUTICO_JEFE',
          permisos: ['farmacia:*'],
        },
      };
    }

    const response = await this.request<CoreAuthResponse>('/auth/sso-exchange', {
      method: 'POST',
      body: JSON.stringify({ ticket }),
    });

    const token = response.token ?? response.accessToken ?? response.access_token;
    if (!token) {
      throw new AppError('Core no devolvió token en el canje SSO', 502);
    }

    return {
      token,
      user: this.mapUser(response.user),
    };
  }

  /**
   * Valida el JWT usando el JWKS del Core (validación local, sin round-trip por request).
   * Si la validación JWKS falla (rotación de claves, token legacy), hace fallback al
   * endpoint /auth/validate del Core.
   */
  async validateToken(token: string): Promise<CoreUser> {
    if (!this.enabled) {
      return { id: 'usr-001', nombre: 'Dr. Alejandro V.', rol: 'FARMACEUTICO_JEFE', permisos: ['farmacia:*'] };
    }

    // 1) Validación local con JWKS (RS256 + exp). No requiere llamada al Core.
    try {
      const { payload } = await jwtVerify(token, this.getJwks(), { algorithms: ['RS256'] });
      return this.mapUserFromJwtPayload(payload);
    } catch {
      // 2) Fallback: /auth/validate del Core (cubre rotación de claves y tokens legacy).
      const response = await this.request<CoreAuthResponse | CoreUserResponse>('/auth/validate', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      return this.mapUser((response as CoreAuthResponse).user ?? (response as CoreUserResponse));
    }
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.integrations.externalTimeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(init.headers ?? {}),
        },
      });

      if (!response.ok) {
        throw new AppError(`Core respondió ${response.status}`, response.status === 401 ? 401 : 502);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Mapea los claims del JWT (user_id, permissions) al CoreUser del módulo.
   * El JWT no incluye nombre ni rol, así que se usan valores neutros.
   */
  private mapUserFromJwtPayload(payload: JWTPayload): CoreUser {
    const permissions = payload['permissions'];
    return {
      id: String(payload['user_id'] ?? 'core-user'),
      nombre: String(payload['nombre'] ?? payload['name'] ?? 'Usuario Core'),
      email: payload['email'] as string | undefined,
      rol: String(payload['rol'] ?? payload['role'] ?? 'USUARIO'),
      permisos: Array.isArray(permissions) ? permissions.map(String) : [],
    };
  }

  private mapUser(user?: CoreUserResponse, fallbackEmail?: string): CoreUser {
    const firstName = user?.first_name ?? '';
    const lastName = user?.last_name ?? '';
    const nombre = user?.name || `${firstName} ${lastName}`.trim() || fallbackEmail || 'Usuario Core';
    const roles = user?.roles ?? [];
    const permissions = user?.permissions ?? [];

    return {
      id: String(user?.id ?? fallbackEmail ?? 'core-user'),
      nombre,
      email: user?.email ?? fallbackEmail,
      rol: user?.role ?? this.firstNamedValue(roles) ?? 'USUARIO',
      permisos: permissions.map((permission) => this.namedValue(permission)),
    };
  }

  private firstNamedValue(values: Array<string | { name?: string; code?: string }>): string | undefined {
    return values.length > 0 ? this.namedValue(values[0]) : undefined;
  }

  private namedValue(value: string | { name?: string; code?: string }): string {
    return typeof value === 'string' ? value : value.code ?? value.name ?? '';
  }
}
