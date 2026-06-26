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
  estado?: EstadoSolicitud;
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

export interface UpdateBorradorData {
  prioridad?: PrioridadSolicitud;
  motivo?: string;
  proveedorSugeridoId?: string;
  observaciones?: string;
  detalles: {
    productoId: string;
    cantidadSolicitada: number;
    unidad?: string;
  }[];
}

export interface ISolicitudCompraRepository {
  findAll(filtros?: FiltrosSolicitudCompra): Promise<SolicitudCompra[]>;
  count(filtros?: FiltrosSolicitudCompra): Promise<number>;
  findById(id: string): Promise<SolicitudCompra | null>;
  create(data: CreateSolicitudCompraData): Promise<SolicitudCompra>;
  update(id: string, data: UpdateSolicitudCompraData): Promise<SolicitudCompra>;
  updateBorrador(id: string, data: UpdateBorradorData): Promise<SolicitudCompra>;
  delete(id: string): Promise<void>;
  /** True si existe una solicitud "abierta" (no rechazada) que incluya el producto. */
  existeSolicitudActivaParaProducto(productoId: string): Promise<boolean>;
}
