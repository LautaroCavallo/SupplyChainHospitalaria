import { Request, Response, NextFunction } from 'express';
import { CoreAuthService } from '../../../infrastructure/external/core/CoreAuthService';
import { LocalAuthService } from '../../../infrastructure/external/core/LocalAuthService';

export class AuthController {
  constructor(
    private readonly coreAuthService: CoreAuthService,
    private readonly localAuthService: LocalAuthService,
  ) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.coreAuthService.login(req.body.email, req.body.password);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, nombre, cargo, rol } = req.body;
      const data = await this.localAuthService.register(email, password, nombre, cargo, rol);
      res.status(201).json({ success: true, data });
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
}
