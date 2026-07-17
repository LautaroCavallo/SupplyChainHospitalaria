import { Request, Response, NextFunction } from 'express';
import { CoreAuthService } from '../../../infrastructure/external/core/CoreAuthService';
import { config } from '../../../config';
import { MOCK_USERS, DEFAULT_MOCK_USER } from '../../../infrastructure/external/core/mockUsers';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        nombre: string;
        email?: string;
        rol: string;
        permisos?: string[];
      };
      authToken?: string;
    }
  }
}

export function createAuthMiddleware(coreAuthService: CoreAuthService) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Endpoints públicos: auth (login, sso), docs, health, y el
    // callback de adjudicación de Compras (webhook de Módulo 7, no trae nuestro JWT).
    if (
      req.path.startsWith('/api/v1/auth/') ||
      req.path.startsWith('/api/docs') ||
      req.path === '/health' ||
      req.path.includes('/confirmacion-adjudicacion')
    ) {
      next();
      return;
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (config.integrations.authMode !== 'core') {
      // Modo mock (solo desarrollo local sin Core disponible): no valida firma, pero
      // respeta el usuario con el que se logueó (ver mockUsers.ts) para poder probar
      // el gating por permisos de cada rol.
      req.authToken = token;
      const mockEmail = token?.startsWith('dev-mock:') ? token.slice('dev-mock:'.length) : undefined;
      req.user = (mockEmail && MOCK_USERS[mockEmail]) || DEFAULT_MOCK_USER;
      next();
      return;
    }

    if (!token) {
      res.status(401).json({ success: false, error: 'Token JWT requerido' });
      return;
    }

    try {
      const user = await coreAuthService.validateToken(token);
      req.authToken = token;
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
}
