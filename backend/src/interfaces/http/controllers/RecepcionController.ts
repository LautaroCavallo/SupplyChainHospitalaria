import { Request, Response, NextFunction } from 'express';
import { ListarRecepciones } from '../../../application/use-cases/recepciones/ListarRecepciones';
import { ObtenerRecepcion } from '../../../application/use-cases/recepciones/ObtenerRecepcion';
import { CrearRecepcion } from '../../../application/use-cases/recepciones/CrearRecepcion';
import { ConfirmarRecepcion } from '../../../application/use-cases/recepciones/ConfirmarRecepcion';
import { ProcesarRecepcion } from '../../../application/use-cases/recepciones/ProcesarRecepcion';

export class RecepcionController {
  constructor(
    private listarRecepciones: ListarRecepciones,
    private obtenerRecepcion: ObtenerRecepcion,
    private crearRecepcion: CrearRecepcion,
    private confirmarRecepcion: ConfirmarRecepcion,
    private procesarRecepcion: ProcesarRecepcion,
  ) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const estado = req.query.estado as string | undefined;

      const result = await this.listarRecepciones.execute({ page, limit, estado });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.obtenerRecepcion.execute(req.params.id as string);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.crearRecepcion.execute(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  confirmar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.confirmarRecepcion.execute(req.params.id as string);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  procesar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.procesarRecepcion.execute(req.params.id as string);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}
