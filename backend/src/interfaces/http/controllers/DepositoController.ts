import { Request, Response, NextFunction } from 'express';
import { ListarDepositos } from '../../../application/use-cases/depositos/ListarDepositos';
import { CrearDeposito } from '../../../application/use-cases/depositos/CrearDeposito';
import { TransferirStock } from '../../../application/use-cases/depositos/TransferirStock';
import { ObtenerStockPorDeposito } from '../../../application/use-cases/depositos/ObtenerStockPorDeposito';

export class DepositoController {
  constructor(
    private listarDepositos: ListarDepositos,
    private crearDeposito: CrearDeposito,
    private transferirStock: TransferirStock,
    private obtenerStockPorDeposito: ObtenerStockPorDeposito,
  ) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const soloActivos = req.query.activos === 'true';
      const data = await this.listarDepositos.execute(soloActivos);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.crearDeposito.execute(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  transferir = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.transferirStock.execute({
        productoId: req.body.productoId,
        depositoOrigenId: req.body.depositoOrigenId,
        depositoDestinoId: req.body.depositoDestinoId,
        cantidad: req.body.cantidad,
        usuarioId: req.user?.nombre ?? req.user?.id,
      });
      res.json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  };

  stockPorProducto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.obtenerStockPorDeposito.execute(req.params.productoId as string);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}
