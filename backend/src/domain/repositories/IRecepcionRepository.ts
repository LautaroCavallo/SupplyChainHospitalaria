import { Recepcion, EstadoRecepcion } from '../entities/Recepcion';

export interface FiltrosRecepcion {
  proveedorId?: string;
  estado?: EstadoRecepcion;
  fechaDesde?: Date;
  fechaHasta?: Date;
  page?: number;
  limit?: number;
}

export interface CreateRecepcionData {
  proveedorId: string;
  remito?: string;
  fechaRecepcion?: Date;
  observaciones?: string;
  usuarioId?: string;
  detalles: {
    productoId: string;
    cantidad: number;
    ean?: string;
    troquel?: string;
    lote: string;
    fechaVencimiento: Date;
  }[];
}

export interface UpdateRecepcionData {
  remito?: string;
  observaciones?: string;
  estado?: EstadoRecepcion;
  detalles?: {
    productoId: string;
    cantidad: number;
    ean?: string;
    troquel?: string;
    lote: string;
    fechaVencimiento: Date;
  }[];
}

export interface IRecepcionRepository {
  findAll(filtros?: FiltrosRecepcion): Promise<Recepcion[]>;
  findById(id: string): Promise<Recepcion | null>;
  create(data: CreateRecepcionData): Promise<Recepcion>;
  update(id: string, data: UpdateRecepcionData): Promise<Recepcion>;
  count(filtros?: FiltrosRecepcion): Promise<number>;
}
