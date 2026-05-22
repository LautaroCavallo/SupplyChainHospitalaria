import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        nombre: string;
        rol: string;
      };
    }
  }
}

export function authMock(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    // In production, validate JWT here
  }

  req.user = {
    id: 'usr-001',
    nombre: 'Dr. Alejandro V.',
    rol: 'FARMACEUTICO_JEFE',
  };

  next();
}
