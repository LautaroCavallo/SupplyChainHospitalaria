import { Request, Response, NextFunction } from 'express';
import { ListarInventario } from '../../../application/use-cases/inventario/ListarInventario';
import { ObtenerProductoInventario } from '../../../application/use-cases/inventario/ObtenerProductoInventario';
import { ObtenerProductoPorEan } from '../../../application/use-cases/inventario/ObtenerProductoPorEan';
import { ObtenerInventarioSummary } from '../../../application/use-cases/inventario/ObtenerInventarioSummary';
import { AjustarStock } from '../../../application/use-cases/inventario/AjustarStock';
import { ObtenerMovimientos } from '../../../application/use-cases/inventario/ObtenerMovimientos';
import { ObtenerLotes } from '../../../application/use-cases/inventario/ObtenerLotes';
import { ObtenerHistorialLote } from '../../../application/use-cases/inventario/ObtenerHistorialLote';

export class InventarioController {
  constructor(
    private listarInventario: ListarInventario,
    private obtenerProductoInventario: ObtenerProductoInventario,
    private obtenerProductoPorEan: ObtenerProductoPorEan,
    private obtenerInventarioSummary: ObtenerInventarioSummary,
    private ajustarStockUC: AjustarStock,
    private obtenerMovimientos: ObtenerMovimientos,
    private obtenerLotes: ObtenerLotes,
    private obtenerHistorialLote: ObtenerHistorialLote,
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

  getSummary = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.obtenerInventarioSummary.execute();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getByEan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.obtenerProductoPorEan.execute(req.params.ean as string);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  ajustarStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.ajustarStockUC.execute(req.params.id as string, req.body, req.user?.nombre ?? req.user?.id);
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

  getHistorialLote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const tipo = req.query.tipo as string | undefined;
      const fechaDesde = req.query.fechaDesde ? new Date(`${req.query.fechaDesde as string}T00:00:00.000Z`) : undefined;
      const fechaHasta = req.query.fechaHasta ? new Date(`${req.query.fechaHasta as string}T23:59:59.999Z`) : undefined;
      const data = await this.obtenerHistorialLote.execute(req.params.loteId as string, { page, limit, tipo, fechaDesde, fechaHasta });
      res.json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  };
}
