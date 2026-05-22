import { SolicitudCompra, EstadoSolicitud, PrioridadSolicitud } from '../entities/SolicitudCompra';

export interface FiltrosSolicitudCompra {
  estado?: EstadoSolicitud;
  prioridad?: PrioridadSolicitud;
  usuarioId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  page?: number;
  limit?: number;
}

export interface CreateSolicitudCompraData {
  prioridad?: PrioridadSolicitud;
  motivo?: string;
  usuarioId?: string;
  detalles: {
    productoId: string;
    cantidadSolicitada: number;
  }[];
}

export interface UpdateSolicitudCompraData {
  estado?: EstadoSolicitud;
  prioridad?: PrioridadSolicitud;
  motivo?: string;
  detalles?: {
    productoId: string;
    cantidadSolicitada: number;
    cantidadAprobada?: number;
  }[];
}

export interface ISolicitudCompraRepository {
  findAll(filtros?: FiltrosSolicitudCompra): Promise<SolicitudCompra[]>;
  findById(id: string): Promise<SolicitudCompra | null>;
  create(data: CreateSolicitudCompraData): Promise<SolicitudCompra>;
  update(id: string, data: UpdateSolicitudCompraData): Promise<SolicitudCompra>;
}
