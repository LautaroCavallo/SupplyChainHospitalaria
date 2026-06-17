import { Request, Response, NextFunction } from 'express';
import { IInventarioRepository, CreateProductoData, UpdateProductoData } from '../../../domain/repositories/IInventarioRepository';
import { ProductoInventario } from '../../../domain/entities/ProductoInventario';

type EstadoMedicamento = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';

interface MedicamentoPayload {
  nombre: string;
  categoria?: string;
  presentacion?: string;
  ean?: string;
  laboratorio?: string;
  estado?: EstadoMedicamento;
  precio?: number;
  observaciones?: string;
}

export class MedicamentoController {
  constructor(private readonly inventarioRepository: IInventarioRepository) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const busqueda = req.query.busqueda as string | undefined;
      const categoria = req.query.categoria as string | undefined;
      const estado = req.query.estado as EstadoMedicamento | undefined;
      // Sin filtro de estado → ambos (activo undefined). ACTIVO → true. INACTIVO → false.
      const activo = estado === 'ACTIVO' ? true
        : (estado === 'INACTIVO' || estado === 'SUSPENDIDO') ? false
        : undefined;

      const productos = await this.inventarioRepository.findAll({
        nombre: busqueda,
        activo,
        page: 1,
        limit: 1000,
      });

      const filtered = productos
        .filter((producto) => producto.categoria === 'MEDICAMENTO')
        .map((producto) => this.toMedicamento(producto))
        .filter((medicamento) => !categoria || medicamento.categoria === categoria);

      const start = (page - 1) * limit;
      const data = filtered.slice(start, start + limit);

      res.json({
        success: true,
        data,
        total: filtered.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
      });
    } catch (error) {
      next(error);
    }
  };

  summary = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const activos = await this.inventarioRepository.count({ activo: true, categoria: 'MEDICAMENTO' });
      const inactivos = await this.inventarioRepository.count({ activo: false, categoria: 'MEDICAMENTO' });
      res.json({
        success: true,
        data: {
          total: activos + inactivos,
          activos,
          inactivos,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = req.body as MedicamentoPayload;
      const data: CreateProductoData = {
        nombre: payload.nombre,
        descripcion: this.buildDescripcion(payload),
        presentacion: payload.presentacion,
        categoria: 'MEDICAMENTO',
        ean: payload.ean,
        stockMinimo: 10,
        stockCritico: 5,
        unidad: 'unidad',
      };

      const created = await this.inventarioRepository.create(data);

      if (payload.estado && payload.estado !== 'ACTIVO') {
        const updated = await this.inventarioRepository.update(created.id, { activo: false });
        res.status(201).json({ success: true, data: this.toMedicamento(updated, payload.categoria) });
        return;
      }

      res.status(201).json({ success: true, data: this.toMedicamento(created, payload.categoria) });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = req.body as Partial<MedicamentoPayload>;
      const data: UpdateProductoData = {
        nombre: payload.nombre,
        descripcion: this.buildDescripcion(payload),
        presentacion: payload.presentacion,
        ean: payload.ean,
        categoria: 'MEDICAMENTO',
        activo: payload.estado ? payload.estado === 'ACTIVO' : undefined,
      };

      const updated = await this.inventarioRepository.update(req.params.id as string, data);
      res.json({ success: true, data: this.toMedicamento(updated, payload.categoria) });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.inventarioRepository.update(req.params.id as string, { activo: false });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  private toMedicamento(producto: ProductoInventario, categoriaOverride?: string) {
    return {
      id: producto.id,
      nombre: producto.nombre,
      categoria: categoriaOverride ?? this.inferCategoria(producto),
      presentacion: producto.presentacion,
      ean: producto.ean,
      laboratorio: producto.proveedor?.razonSocial,
      estado: producto.activo ? 'ACTIVO' : 'INACTIVO',
      observaciones: this.stripCategoria(producto.descripcion),
    };
  }

  private inferCategoria(producto: ProductoInventario): string {
    const explicit = producto.descripcion?.match(/^\[Categoria: ([^\]]+)\]/);
    if (explicit) return explicit[1];

    const text = `${producto.descripcion ?? ''} ${producto.principioActivo ?? ''}`.toLowerCase();
    if (text.includes('antibiótico') || text.includes('amoxicilina')) return 'Antibióticos';
    if (text.includes('analgésico') || text.includes('ibuprofeno') || text.includes('paracetamol')) return 'Analgésicos';
    if (text.includes('insulina')) return 'Endocrinología';
    if (text.includes('anestésico') || text.includes('propofol')) return 'Anestesia';
    return 'Otro';
  }

  private buildDescripcion(payload: Partial<MedicamentoPayload>): string | undefined {
    if (payload.categoria && payload.observaciones) {
      return `[Categoria: ${payload.categoria}] ${payload.observaciones}`;
    }
    if (payload.categoria) {
      return `[Categoria: ${payload.categoria}]`;
    }
    return payload.observaciones;
  }

  private stripCategoria(descripcion?: string): string | undefined {
    return descripcion?.replace(/^\[Categoria: [^\]]+\]\s*/, '') || undefined;
  }
}
