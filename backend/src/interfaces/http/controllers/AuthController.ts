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
   * Canje del ticket SSO (server-to-server). El frontend cae en /auth/sso con el ticket,
   * lo manda acá, y devolvemos { user, token } para que arme su sesión.
   */
  ssoExchange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.coreClient.exchangeSsoTicket(req.body.ticket);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}
