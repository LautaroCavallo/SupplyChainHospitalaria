import { Request, Response, NextFunction } from 'express';
import { ValidarReceta } from '../../../application/use-cases/recetas/ValidarReceta';
import { ConsumirReceta } from '../../../application/use-cases/recetas/ConsumirReceta';

export class RecetaController {
  constructor(
    private validarReceta: ValidarReceta,
    private consumirReceta: ConsumirReceta,
  ) {}

  validar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.validarReceta.execute(req.params.id as string);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  consumir = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.consumirReceta.execute(req.params.id as string, req.body.items);
      res.json({ success: true, message: 'Receta consumida exitosamente' });
    } catch (error) {
      next(error);
    }
  };
}
