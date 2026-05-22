import { Request, Response, NextFunction } from 'express';
import { ListarSolicitudesCompra } from '../../../application/use-cases/solicitudes/ListarSolicitudesCompra';
import { CrearSolicitudCompra } from '../../../application/use-cases/solicitudes/CrearSolicitudCompra';

export class SolicitudCompraController {
  constructor(
    private listarSolicitudesCompra: ListarSolicitudesCompra,
    private crearSolicitudCompra: CrearSolicitudCompra,
  ) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const estado = req.query.estado as string | undefined;
      const data = await this.listarSolicitudesCompra.execute({ estado });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.crearSolicitudCompra.execute(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}
