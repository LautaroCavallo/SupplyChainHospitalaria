import { Request, Response, NextFunction } from 'express';
import { ListarInventario } from '../../../application/use-cases/inventario/ListarInventario';
import { ObtenerProductoInventario } from '../../../application/use-cases/inventario/ObtenerProductoInventario';
import { AjustarStock } from '../../../application/use-cases/inventario/AjustarStock';
import { ObtenerMovimientos } from '../../../application/use-cases/inventario/ObtenerMovimientos';
import { ObtenerLotes } from '../../../application/use-cases/inventario/ObtenerLotes';

export class InventarioController {
  constructor(
    private listarInventario: ListarInventario,
    private obtenerProductoInventario: ObtenerProductoInventario,
    private ajustarStockUC: AjustarStock,
    private obtenerMovimientos: ObtenerMovimientos,
    private obtenerLotes: ObtenerLotes,
  ) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const busqueda = req.query.busqueda as string | undefined;
      const categoria = req.query.categoria as string | undefined;
      const estado = req.query.estado as string | undefined;

      const result = await this.listarInventario.execute({ page, limit, busqueda, categoria, estado });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.obtenerProductoInventario.execute(req.params.id as string);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  ajustarStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.ajustarStockUC.execute(req.params.id as string, req.body);
      res.json({ success: true, message: 'Stock ajustado correctamente' });
    } catch (error) {
      next(error);
    }
  };

  getMovimientos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.obtenerMovimientos.execute(req.params.id as string);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getLotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.obtenerLotes.execute(req.params.id as string);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}
