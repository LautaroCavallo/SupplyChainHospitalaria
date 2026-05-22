export type EstadoLote = 'VIGENTE' | 'PROXIMO_A_VENCER' | 'VENCIDO';

export class Lote {
  readonly id: string;
  numeroLote: string;
  productoId: string;
  fechaVencimiento: Date;
  stockDisponible: number;
  stockInicial: number;
  estado: EstadoLote;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    id: string;
    numeroLote: string;
    productoId: string;
    fechaVencimiento: Date;
    stockDisponible: number;
    stockInicial: number;
    estado?: EstadoLote;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.numeroLote = props.numeroLote;
    this.productoId = props.productoId;
    this.fechaVencimiento = props.fechaVencimiento;
    this.stockDisponible = props.stockDisponible;
    this.stockInicial = props.stockInicial;
    this.estado = props.estado ?? this.calcularEstado();
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  isVencido(): boolean {
    return new Date() > this.fechaVencimiento;
  }

  isProximoAVencer(diasUmbral: number = 90): boolean {
    if (this.isVencido()) return false;
    const ahora = new Date();
    const umbral = new Date(ahora.getTime() + diasUmbral * 24 * 60 * 60 * 1000);
    return this.fechaVencimiento <= umbral;
  }

  calcularEstado(): EstadoLote {
    if (this.isVencido()) return 'VENCIDO';
    if (this.isProximoAVencer()) return 'PROXIMO_A_VENCER';
    return 'VIGENTE';
  }

  actualizarEstado(): void {
    this.estado = this.calcularEstado();
    this.updatedAt = new Date();
  }

  validar(): string[] {
    const errores: string[] = [];

    if (!this.numeroLote || this.numeroLote.trim().length === 0) {
      errores.push('El número de lote es requerido');
    }

    if (!this.productoId) {
      errores.push('El producto es requerido');
    }

    if (!this.fechaVencimiento) {
      errores.push('La fecha de vencimiento es requerida');
    }

    if (this.stockInicial < 0) {
      errores.push('El stock inicial no puede ser negativo');
    }

    if (this.stockDisponible < 0) {
      errores.push('El stock disponible no puede ser negativo');
    }

    if (this.stockDisponible > this.stockInicial) {
      errores.push('El stock disponible no puede superar el stock inicial');
    }

    return errores;
  }
}
