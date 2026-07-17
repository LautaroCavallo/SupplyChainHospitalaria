import { Request, Response, NextFunction } from 'express';
import { CoreAuthService } from '../../../infrastructure/external/core/CoreAuthService';
import { CoreClient } from '../../../infrastructure/external/core/CoreClient';

export class AuthController {
  constructor(
    private readonly coreAuthService: CoreAuthService,
    private readonly coreClient: CoreClient,
  ) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.coreAuthService.login(req.body.email, req.body.password);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /auth/sso?ticket=…&redirect=/ruta-interna
   *
   * Canjea el ticket SSO contra el Core (servidor-a-servidor) y devuelve el JWT
   * al frontend. El frontend guarda el token y navega a `redirect`.
   * El ticket es de un solo uso y expira en ~60 s; se canjea de inmediato.
   */
  ssoCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ticket, redirect } = req.query;

      if (!ticket || typeof ticket !== 'string') {
        res.status(400).json({ success: false, error: 'Parámetro ticket requerido' });
        return;
      }

      const rawRedirect = typeof redirect === 'string' ? redirect : '/';
      const safeRedirect =
        rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') && !rawRedirect.startsWith('/\\')
          ? rawRedirect
          : '/';

      const data = await this.coreAuthService.exchangeTicket(ticket);
      res.json({ success: true, data: { ...data, redirect: safeRedirect } });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /auth/sso-ticket
   *
   * SSO saliente: pide a Core un ticket de un solo uso para el usuario actualmente
   * logueado en Farmacia, así el frontend puede redirigirlo a otro módulo ya autenticado.
   * Requiere el JWT del usuario en el header Authorization (esta ruta está fuera del
   * gating del middleware de auth, así que se lee acá directamente).
   */
  getSsoTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

      if (!token) {
        res.status(401).json({ success: false, error: 'Token JWT requerido' });
        return;
      }

      const data = await this.coreClient.obtenerSsoTicket(token);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}
