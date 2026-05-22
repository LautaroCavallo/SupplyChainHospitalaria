export type EstadoRecepcion = 'BORRADOR' | 'CONFIRMADA' | 'PROCESADA';

export class RecepcionDetalle {
  readonly id: string;
  readonly recepcionId: string;
  readonly productoId: string;
  readonly cantidad: number;
  readonly ean?: string;
  readonly troquel?: string;
  readonly lote: string;
  readonly fechaVencimiento: Date;

  constructor(props: {
    id: string;
    recepcionId: string;
    productoId: string;
    cantidad: number;
    ean?: string;
    troquel?: string;
    lote: string;
    fechaVencimiento: Date;
  }) {
    this.id = props.id;
    this.recepcionId = props.recepcionId;
    this.productoId = props.productoId;
    this.cantidad = props.cantidad;
    this.ean = props.ean;
    this.troquel = props.troquel;
    this.lote = props.lote;
    this.fechaVencimiento = props.fechaVencimiento;
  }

  validar(): string[] {
    const errores: string[] = [];

    if (!this.productoId) errores.push('El producto es requerido');
    if (this.cantidad <= 0) errores.push('La cantidad debe ser mayor a cero');
    if (!this.lote || this.lote.trim().length === 0) errores.push('El lote es requerido');
    if (!this.fechaVencimiento) errores.push('La fecha de vencimiento es requerida');

    return errores;
  }
}

export class Recepcion {
  readonly id: string;
  proveedorId: string;
  remito?: string;
  fechaRecepcion: Date;
  estado: EstadoRecepcion;
  observaciones?: string;
  usuarioId?: string;
  totalItems: number;
  detalles: RecepcionDetalle[];
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    id: string;
    proveedorId: string;
    remito?: string;
    fechaRecepcion?: Date;
    estado?: EstadoRecepcion;
    observaciones?: string;
    usuarioId?: string;
    totalItems?: number;
    detalles?: RecepcionDetalle[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.proveedorId = props.proveedorId;
    this.remito = props.remito;
    this.fechaRecepcion = props.fechaRecepcion ?? new Date();
    this.estado = props.estado ?? 'BORRADOR';
    this.observaciones = props.observaciones;
    this.usuarioId = props.usuarioId;
    this.detalles = props.detalles ?? [];
    this.totalItems = props.totalItems ?? this.calcularTotalItems();
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  confirmar(): void {
    if (this.estado !== 'BORRADOR') {
      throw new Error('Solo se puede confirmar una recepción en estado BORRADOR');
    }
    if (this.detalles.length === 0) {
      throw new Error('La recepción debe tener al menos un detalle');
    }
    this.estado = 'CONFIRMADA';
    this.totalItems = this.calcularTotalItems();
    this.updatedAt = new Date();
  }

  procesar(): void {
    if (this.estado !== 'CONFIRMADA') {
      throw new Error('Solo se puede procesar una recepción en estado CONFIRMADA');
    }
    this.estado = 'PROCESADA';
    this.updatedAt = new Date();
  }

  calcularTotalItems(): number {
    return this.detalles.reduce((total, detalle) => total + detalle.cantidad, 0);
  }

  validar(): string[] {
    const errores: string[] = [];

    if (!this.proveedorId) {
      errores.push('El proveedor es requerido');
    }

    if (this.detalles.length === 0) {
      errores.push('La recepción debe tener al menos un detalle');
    }

    for (const detalle of this.detalles) {
      errores.push(...detalle.validar());
    }

    return errores;
  }
}
