import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../application/errors/AppError';
import logger from '../../../config/logger';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  if (err.name === 'ValidationError' || (err as any).type === 'entity.parse.failed') {
    res.status(400).json({
      success: false,
      error: 'Datos de entrada inválidos',
    });
    return;
  }

  logger.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
  });
}
