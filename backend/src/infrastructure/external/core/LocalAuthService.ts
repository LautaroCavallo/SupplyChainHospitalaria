import { PrismaClient } from '@prisma/client';
import { SignJWT, jwtVerify } from 'jose';
import { randomBytes, pbkdf2Sync } from 'crypto';
import { AppError } from '../../../application/errors/AppError';
import { config } from '../../../config';
import type { CoreLoginResult, CoreUser } from './CoreAuthService';

function getSecret() {
  return new TextEncoder().encode(config.jwtSecret);
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100_000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const derived = pbkdf2Sync(password, salt, 100_000, 64, 'sha512').toString('hex');
  return derived === hash;
}

async function signToken(user: { id: string; nombre: string; email: string; rol: string; cargo: string }): Promise<string> {
  return new SignJWT({ nombre: user.nombre, email: user.email, rol: user.rol, cargo: user.cargo })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSecret());
}

export async function verifyLocalToken(token: string): Promise<CoreUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'] });
    return {
      id: payload.sub ?? 'usr-001',
      nombre: String((payload as any).nombre ?? 'Usuario'),
      email: String((payload as any).email ?? ''),
      rol: String((payload as any).rol ?? 'FARMACEUTICO'),
      cargo: String((payload as any).cargo ?? ''),
      permisos: ['farmacia:*'],
    };
  } catch {
    return null;
  }
}

export class LocalAuthService {
  private prisma = new PrismaClient();

  async getUserCount(): Promise<number> {
    return this.prisma.usuario.count();
  }

  async register(
    email: string,
    password: string,
    nombre: string,
    cargo?: string,
    rol?: string,
  ): Promise<CoreLoginResult> {
    const existing = await this.prisma.usuario.findUnique({ where: { email } });
    if (existing) throw new AppError('El email ya está registrado', 409);

    const user = await this.prisma.usuario.create({
      data: {
        email,
        nombre,
        passwordHash: hashPassword(password),
        cargo: cargo ?? 'Farmacéutico',
        rol: rol ?? 'FARMACEUTICO',
      },
    });

    return {
      token: await signToken(user),
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol, cargo: user.cargo, permisos: ['farmacia:*'] },
    };
  }

  async login(email: string, password: string): Promise<CoreLoginResult> {
    const user = await this.prisma.usuario.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new AppError('Credenciales incorrectas', 401);
    }
    if (!user.activo) throw new AppError('Usuario inactivo', 403);

    return {
      token: await signToken(user),
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol, cargo: user.cargo, permisos: ['farmacia:*'] },
    };
  }
}
