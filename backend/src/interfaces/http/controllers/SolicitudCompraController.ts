import { Request, Response, NextFunction } from 'express';
import { ListarSolicitudesCompra } from '../../../application/use-cases/solicitudes/ListarSolicitudesCompra';
import { CrearSolicitudCompra } from '../../../application/use-cases/solicitudes/CrearSolicitudCompra';
import { ActualizarSolicitudCompra } from '../../../application/use-cases/solicitudes/ActualizarSolicitudCompra';
import { EliminarSolicitudCompra } from '../../../application/use-cases/solicitudes/EliminarSolicitudCompra';
import { ConfirmarBorrador } from '../../../application/use-cases/solicitudes/ConfirmarBorrador';
import { EnviarOrdenCompra } from '../../../application/use-cases/solicitudes/EnviarOrdenCompra';
import { ConfirmarAdjudicacion } from '../../../application/use-cases/solicitudes/ConfirmarAdjudicacion';
import { ISolicitudCompraRepository } from '../../../domain/repositories/ISolicitudCompraRepository';
import { NotFoundError } from '../../../application/errors/AppError';

export class SolicitudCompraController {
  constructor(
    private listarSolicitudesCompra: ListarSolicitudesCompra,
    private crearSolicitudCompra: CrearSolicitudCompra,
    private actualizarSolicitudCompra: ActualizarSolicitudCompra,
    private eliminarSolicitudCompra: EliminarSolicitudCompra,
    private confirmarBorradorUseCase: ConfirmarBorrador,
    private enviarOrdenCompraUseCase: EnviarOrdenCompra,
    private confirmarAdjudicacionUseCase: ConfirmarAdjudicacion,
    private solicitudRepository: ISolicitudCompraRepository,
  ) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const estado = req.query.estado as string | undefined;

      const result = await this.listarSolicitudesCompra.execute({ page, limit, estado });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params['id'] as string;
      const data = await this.solicitudRepository.findById(id);
      if (!data) throw new NotFoundError(`Solicitud ${id} no encontrada`);
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

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params['id'] as string;
      const data = await this.actualizarSolicitudCompra.execute(id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params['id'] as string;
      await this.eliminarSolicitudCompra.execute(id);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  confirmarBorrador = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params['id'] as string;
      const data = await this.confirmarBorradorUseCase.execute(id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  enviarACompras = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params['id'] as string;
      const host = req.get('host') as string;
      const backendBaseUrl = `${req.protocol}://${host}`;
      const data = await this.enviarOrdenCompraUseCase.execute(id, backendBaseUrl);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  confirmarAdjudicacion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params['id'] as string;
      const data = await this.confirmarAdjudicacionUseCase.execute(id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}
