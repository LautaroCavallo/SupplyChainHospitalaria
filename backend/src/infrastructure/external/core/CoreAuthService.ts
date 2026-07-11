import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { AppError } from '../../../application/errors/AppError';
import { config } from '../../../config';

export interface CoreUser {
  id: string;
  nombre: string;
  email?: string;
  rol: string;
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

export class CoreAuthService {
  private readonly baseUrl = config.integrations.coreApiUrl.replace(/\/$/, '');
  private readonly jwksUrl = config.integrations.coreJwksUrl;
  // JWKS remoto de Core (cachea las claves y reintenta si aparece un kid nuevo).
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

  get enabled(): boolean {
    return Boolean(this.baseUrl);
  }

  private getJwks(): ReturnType<typeof createRemoteJWKSet> {
    if (!this.jwks) {
      if (!this.jwksUrl) throw new AppError('CORE_JWKS_URL no configurado', 500);
      this.jwks = createRemoteJWKSet(new URL(this.jwksUrl));
    }
    return this.jwks;
  }

  async login(email: string, password: string): Promise<CoreLoginResult> {
    if (!this.enabled) {
      return {
        token: 'dev-token',
        user: {
          id: 'usr-001',
          nombre: 'Usuario Farmacia',
          email,
          rol: 'FARMACEUTICO_JEFE',
          permisos: ['farmacia:*'],
        },
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

  async validateToken(token: string): Promise<CoreUser> {
    if (!this.enabled) {
      return {
        id: 'usr-001',
        nombre: 'Dr. Alejandro V.',
        rol: 'FARMACEUTICO_JEFE',
        permisos: ['farmacia:*'],
      };
    }

    // Verificación LOCAL de la firma contra el JWKS de Core (RS256). No llama a Core por request.
    const jwks = this.getJwks(); // errores de config (URL faltante) => 500, fuera del try
    let payload: JWTPayload;
    try {
      ({ payload } = await jwtVerify(token, jwks, { algorithms: ['RS256'] }));
    } catch {
      // token malformado, firma inválida, expirado, etc. => 401
      throw new AppError('Token JWT inválido o expirado', 401);
    }
    return this.userFromClaims(payload);
  }

  /**
   * Mapea los claims del JWT de Core a nuestro modelo.
   * Core emite: { user_id: number, permissions: string[], exp, iat }.
   * El token NO trae rol ni email → el rol se deriva de los permisos y el nombre queda genérico.
   */
  private userFromClaims(payload: JWTPayload): CoreUser {
    const userId = String((payload as any).user_id ?? payload.sub ?? '');
    const permisos = Array.isArray((payload as any).permissions) ? ((payload as any).permissions as string[]) : [];
    return {
      id: userId,
      nombre: (payload as any).name ?? (payload as any).email ?? `Usuario ${userId}`,
      email: (payload as any).email,
      rol: (payload as any).role ?? (permisos.length ? 'CORE_USER' : 'USUARIO'),
      permisos,
    };
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
