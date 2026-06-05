import { Request, Response, NextFunction } from 'express';
import { CoreAuthService } from '../../../infrastructure/external/core/CoreAuthService';

export class AuthController {
  constructor(private readonly coreAuthService: CoreAuthService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.coreAuthService.login(req.body.email, req.body.password);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}
