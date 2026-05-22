import { Request, Response, NextFunction } from 'express';
import { BuscarMedicamentos } from '../../../application/use-cases/vademecum/BuscarMedicamentos';
import { ObtenerMedicamento } from '../../../application/use-cases/vademecum/ObtenerMedicamento';

export class VademecumController {
  constructor(
    private buscarMedicamentos: BuscarMedicamentos,
    private obtenerMedicamento: ObtenerMedicamento,
  ) {}

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = (req.query.q as string) || '';
      const data = await this.buscarMedicamentos.execute(q);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.obtenerMedicamento.execute(req.params.id as string);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}
