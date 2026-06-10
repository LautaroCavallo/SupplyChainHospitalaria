export type EstadoSolicitud = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'ENVIADA';
export type PrioridadSolicitud = 'BAJA' | 'NORMAL' | 'ALTA' | 'URGENTE';

export class SolicitudCompraDetalle {
  readonly id: string;
  readonly solicitudId: string;
  readonly productoId: string;
  readonly cantidadSolicitada: number;
  cantidadAprobada?: number;
  unidad: string;
  precioUnitario?: number;

  constructor(props: {
    id: string;
    solicitudId: string;
    productoId: string;
    cantidadSolicitada: number;
    cantidadAprobada?: number;
    unidad?: string;
    precioUnitario?: number;
  }) {
    this.id = props.id;
    this.solicitudId = props.solicitudId;
    this.productoId = props.productoId;
    this.cantidadSolicitada = props.cantidadSolicitada;
    this.cantidadAprobada = props.cantidadAprobada;
    this.unidad = props.unidad ?? 'unidad';
    this.precioUnitario = props.precioUnitario;
  }

  validar(): string[] {
    const errores: string[] = [];

    if (!this.productoId) errores.push('El producto es requerido');
    if (this.cantidadSolicitada <= 0) errores.push('La cantidad solicitada debe ser mayor a cero');
    if (this.cantidadAprobada !== undefined && this.cantidadAprobada < 0) {
      errores.push('La cantidad aprobada no puede ser negativa');
    }

    return errores;
  }
}

export class SolicitudCompra {
  readonly id: string;
  estado: EstadoSolicitud;
  prioridad: PrioridadSolicitud;
  motivo?: string;
  usuarioId?: string;
  detalles: SolicitudCompraDetalle[];
  readonly createdAt: Date;
  updatedAt: Date;

  // Campos OC
  ordenCompraId?: string;
  ordenCompraExternaId?: string;
  referenciaExterna?: string;
  proveedorSugeridoId?: string;
  proveedorAdjudicadoRazonSocial?: string;
  fechaAprobacion?: Date;
  fechaEntregaEstimada?: Date;
  observaciones?: string;

  constructor(props: {
    id: string;
    estado?: EstadoSolicitud;
    prioridad?: PrioridadSolicitud;
    motivo?: string;
    usuarioId?: string;
    detalles?: SolicitudCompraDetalle[];
    createdAt?: Date;
    updatedAt?: Date;
    ordenCompraId?: string;
    ordenCompraExternaId?: string;
    referenciaExterna?: string;
    proveedorSugeridoId?: string;
    proveedorAdjudicadoRazonSocial?: string;
    fechaAprobacion?: Date;
    fechaEntregaEstimada?: Date;
    observaciones?: string;
  }) {
    this.id = props.id;
    this.estado = props.estado ?? 'PENDIENTE';
    this.prioridad = props.prioridad ?? 'NORMAL';
    this.motivo = props.motivo;
    this.usuarioId = props.usuarioId;
    this.detalles = props.detalles ?? [];
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this.ordenCompraId = props.ordenCompraId;
    this.ordenCompraExternaId = props.ordenCompraExternaId;
    this.referenciaExterna = props.referenciaExterna;
    this.proveedorSugeridoId = props.proveedorSugeridoId;
    this.proveedorAdjudicadoRazonSocial = props.proveedorAdjudicadoRazonSocial;
    this.fechaAprobacion = props.fechaAprobacion;
    this.fechaEntregaEstimada = props.fechaEntregaEstimada;
    this.observaciones = props.observaciones;
  }

  enviar(): void {
    if (this.estado !== 'PENDIENTE') {
      throw new Error('Solo se puede enviar una solicitud en estado PENDIENTE');
    }
    this.estado = 'ENVIADA';
    this.updatedAt = new Date();
  }

  aprobar(data: {
    referenciaExterna?: string;
    proveedorAdjudicadoRazonSocial?: string;
    fechaAprobacion?: Date;
    fechaEntregaEstimada?: Date;
    observaciones?: string;
  }): void {
    if (this.estado !== 'ENVIADA') {
      throw new Error('Solo se puede aprobar una solicitud en estado ENVIADA');
    }
    this.estado = 'APROBADA';
    this.referenciaExterna = data.referenciaExterna;
    this.proveedorAdjudicadoRazonSocial = data.proveedorAdjudicadoRazonSocial;
    this.fechaAprobacion = data.fechaAprobacion ?? new Date();
    this.fechaEntregaEstimada = data.fechaEntregaEstimada;
    this.observaciones = data.observaciones;
    this.updatedAt = new Date();
  }

  rechazar(data: {
    referenciaExterna?: string;
    observaciones?: string;
  }): void {
    if (this.estado !== 'ENVIADA') {
      throw new Error('Solo se puede rechazar una solicitud en estado ENVIADA');
    }
    this.estado = 'RECHAZADA';
    this.referenciaExterna = data.referenciaExterna;
    this.observaciones = data.observaciones;
    this.updatedAt = new Date();
  }

  validar(): string[] {
    const errores: string[] = [];

    if (this.detalles.length === 0) {
      errores.push('La solicitud debe tener al menos un detalle');
    }

    for (const detalle of this.detalles) {
      errores.push(...detalle.validar());
    }

    return errores;
  }
}
