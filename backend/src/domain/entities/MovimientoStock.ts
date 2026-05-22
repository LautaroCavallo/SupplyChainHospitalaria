export type TipoMovimiento =
  | 'INGRESO'
  | 'EGRESO'
  | 'AJUSTE_POSITIVO'
  | 'AJUSTE_NEGATIVO'
  | 'CONSUMO_RECETA';

export class MovimientoStock {
  readonly id: string;
  readonly productoId: string;
  readonly loteId?: string;
  readonly tipo: TipoMovimiento;
  readonly cantidad: number;
  readonly motivo: string;
  readonly referencia?: string;
  readonly usuarioId?: string;
  readonly createdAt: Date;

  constructor(props: {
    id: string;
    productoId: string;
    loteId?: string;
    tipo: TipoMovimiento;
    cantidad: number;
    motivo: string;
    referencia?: string;
    usuarioId?: string;
    createdAt?: Date;
  }) {
    this.id = props.id;
    this.productoId = props.productoId;
    this.loteId = props.loteId;
    this.tipo = props.tipo;
    this.cantidad = props.cantidad;
    this.motivo = props.motivo;
    this.referencia = props.referencia;
    this.usuarioId = props.usuarioId;
    this.createdAt = props.createdAt ?? new Date();
  }

  esIngreso(): boolean {
    return this.tipo === 'INGRESO' || this.tipo === 'AJUSTE_POSITIVO';
  }

  esEgreso(): boolean {
    return (
      this.tipo === 'EGRESO' ||
      this.tipo === 'AJUSTE_NEGATIVO' ||
      this.tipo === 'CONSUMO_RECETA'
    );
  }

  getCantidadConSigno(): number {
    return this.esIngreso() ? this.cantidad : -this.cantidad;
  }

  validar(): string[] {
    const errores: string[] = [];

    if (!this.productoId) {
      errores.push('El producto es requerido');
    }

    if (this.cantidad <= 0) {
      errores.push('La cantidad debe ser mayor a cero');
    }

    if (!this.motivo || this.motivo.trim().length === 0) {
      errores.push('El motivo es requerido');
    }

    return errores;
  }
}
