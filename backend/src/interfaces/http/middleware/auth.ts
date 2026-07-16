import { Request, Response, NextFunction } from 'express';
import { CoreAuthService } from '../../../infrastructure/external/core/CoreAuthService';
import { verifyLocalToken } from '../../../infrastructure/external/core/LocalAuthService';
import { config } from '../../../config';

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
    // Endpoints públicos: auth (login, register, sso, sso-exchange), docs, health, y el
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
      req.authToken = token;
      if (token && token !== 'dev-token') {
        const localUser = await verifyLocalToken(token);
        if (localUser) {
          req.user = localUser;
          next();
          return;
        }
      }
      req.user = { id: 'usr-001', nombre: 'Dr. Alejandro V.', rol: 'FARMACEUTICO_JEFE', permisos: ['farmacia:*'] };
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
