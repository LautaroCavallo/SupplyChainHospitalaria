import { Request, Response, NextFunction } from 'express';
import { ObtenerDashboard } from '../../../application/use-cases/dashboard/ObtenerDashboard';
import { ObtenerActividadReciente } from '../../../application/use-cases/dashboard/ObtenerActividadReciente';

export class DashboardController {
  constructor(
    private readonly obtenerDashboard: ObtenerDashboard,
    private readonly obtenerActividadReciente: ObtenerActividadReciente,
  ) {}

  summary = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.obtenerDashboard.execute();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  actividad = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const desde = req.query.desde ? new Date(`${req.query.desde as string}T00:00:00.000Z`) : undefined;
      const hasta = req.query.hasta ? new Date(`${req.query.hasta as string}T23:59:59.999Z`) : undefined;
      const data = await this.obtenerActividadReciente.execute({
        page,
        limit,
        busqueda: req.query.busqueda as string | undefined,
        usuario: req.query.usuario as string | undefined,
        evento: req.query.evento as string | undefined,
        desde,
        hasta,
      });

      res.json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  };
}
