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
  proveedorSugeridoId?: string;
  detalles: {
    productoId: string;
    cantidadSolicitada: number;
    unidad?: string;
  }[];
}

export interface UpdateSolicitudCompraData {
  estado?: EstadoSolicitud;
  prioridad?: PrioridadSolicitud;
  motivo?: string;
  ordenCompraId?: string;
  ordenCompraExternaId?: string;
  referenciaExterna?: string;
  proveedorSugeridoId?: string;
  proveedorAdjudicadoRazonSocial?: string;
  fechaAprobacion?: Date;
  fechaEntregaEstimada?: Date;
  observaciones?: string;
  detalles?: {
    productoId: string;
    cantidadSolicitada?: number;
    cantidadAprobada?: number;
    precioUnitario?: number;
  }[];
}

export interface ISolicitudCompraRepository {
  findAll(filtros?: FiltrosSolicitudCompra): Promise<SolicitudCompra[]>;
  findById(id: string): Promise<SolicitudCompra | null>;
  create(data: CreateSolicitudCompraData): Promise<SolicitudCompra>;
  update(id: string, data: UpdateSolicitudCompraData): Promise<SolicitudCompra>;
}
