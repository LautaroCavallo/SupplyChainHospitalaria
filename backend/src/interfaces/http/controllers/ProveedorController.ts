import { Request, Response, NextFunction } from 'express';
import { ListarProveedores } from '../../../application/use-cases/proveedores/ListarProveedores';
import { ObtenerProveedor } from '../../../application/use-cases/proveedores/ObtenerProveedor';
import { CrearProveedor } from '../../../application/use-cases/proveedores/CrearProveedor';
import { ActualizarProveedor } from '../../../application/use-cases/proveedores/ActualizarProveedor';
import { EliminarProveedor } from '../../../application/use-cases/proveedores/EliminarProveedor';

export class ProveedorController {
  constructor(
    private listarProveedores: ListarProveedores,
    private obtenerProveedor: ObtenerProveedor,
    private crearProveedor: CrearProveedor,
    private actualizarProveedor: ActualizarProveedor,
    private eliminarProveedor: EliminarProveedor,
  ) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const busqueda = req.query.busqueda as string | undefined;
      const activo = req.query.activo !== undefined ? req.query.activo === 'true' : undefined;

      const result = await this.listarProveedores.execute({ page, limit, busqueda, activo });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.obtenerProveedor.execute(req.params.id as string);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.crearProveedor.execute(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.actualizarProveedor.execute(req.params.id as string, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.eliminarProveedor.execute(req.params.id as string);
      res.json({ success: true, message: 'Proveedor eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  };
}
