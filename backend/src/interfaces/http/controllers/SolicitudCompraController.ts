import { Request, Response, NextFunction } from 'express';
import { ListarSolicitudesCompra } from '../../../application/use-cases/solicitudes/ListarSolicitudesCompra';
import { CrearSolicitudCompra } from '../../../application/use-cases/solicitudes/CrearSolicitudCompra';
import { EnviarOrdenCompra } from '../../../application/use-cases/solicitudes/EnviarOrdenCompra';
import { ConfirmarAdjudicacion } from '../../../application/use-cases/solicitudes/ConfirmarAdjudicacion';
import { ISolicitudCompraRepository } from '../../../domain/repositories/ISolicitudCompraRepository';
import { NotFoundError } from '../../../application/errors/AppError';

export class SolicitudCompraController {
  constructor(
    private listarSolicitudesCompra: ListarSolicitudesCompra,
    private crearSolicitudCompra: CrearSolicitudCompra,
    private enviarOrdenCompraUseCase: EnviarOrdenCompra,
    private confirmarAdjudicacionUseCase: ConfirmarAdjudicacion,
    private solicitudRepository: ISolicitudCompraRepository,
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
