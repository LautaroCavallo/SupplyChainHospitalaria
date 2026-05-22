import { Request, Response, NextFunction } from 'express';
import { DetectarStockCritico } from '../../../application/use-cases/alertas/DetectarStockCritico';

export class AlertaController {
  constructor(
    private detectarStockCritico: DetectarStockCritico,
  ) {}

  getStockCritico = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.detectarStockCritico.execute();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}
