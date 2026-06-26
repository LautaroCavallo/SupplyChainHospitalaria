export type NivelStock = 'NORMAL' | 'BAJO' | 'CRITICO' | 'SIN_STOCK';

export type CategoriaProducto =
  | 'MEDICAMENTO'
  | 'INSUMO_MEDICO'
  | 'DESCARTABLE'
  | 'REACTIVO'
  | 'OTRO';

/**
 * Factor para derivar el stock mínimo a partir del stock crítico.
 * El "mínimo" (umbral de aviso temprano) es siempre el doble del crítico.
 */
export const FACTOR_STOCK_MINIMO = 2;

export class ProductoInventario {
  readonly id: string;
  nombre: string;
  descripcion?: string;
  principioActivo?: string;
  presentacion?: string;
  categoria: CategoriaProducto;
  ean?: string;
  troquel?: string;
  stockActual: number;
  stockCritico: number;
  unidad: string;
  proveedorId?: string;
  proveedor?: { id: string; razonSocial: string } | null;
  genericoId?: string;
  generico?: {
    id: string;
    nombre: string;
    principioActivo: string;
    dosis?: string | null;
    formaFarmaceutica?: string | null;
    nombreNormalizado: string;
  } | null;
  activo: boolean;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    id: string;
    nombre: string;
    descripcion?: string;
    principioActivo?: string;
    presentacion?: string;
    categoria: CategoriaProducto;
    ean?: string;
    troquel?: string;
    stockActual?: number;
    stockMinimo?: number;
    stockCritico?: number;
    unidad: string;
    proveedorId?: string;
    proveedor?: { id: string; razonSocial: string } | null;
    genericoId?: string;
    generico?: {
      id: string;
      nombre: string;
      principioActivo: string;
      dosis?: string | null;
      formaFarmaceutica?: string | null;
      nombreNormalizado: string;
    } | null;
    activo?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.nombre = props.nombre;
    this.descripcion = props.descripcion;
    this.principioActivo = props.principioActivo;
    this.presentacion = props.presentacion;
    this.categoria = props.categoria;
    this.ean = props.ean;
    this.troquel = props.troquel;
    this.stockActual = props.stockActual ?? 0;
    this.stockCritico = props.stockCritico ?? 0;
    this.unidad = props.unidad;
    this.proveedorId = props.proveedorId;
    this.proveedor = props.proveedor ?? null;
    this.genericoId = props.genericoId;
    this.generico = props.generico ?? null;
    this.activo = props.activo ?? true;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  /** Stock mínimo (umbral de aviso temprano) derivado del crítico. */
  get stockMinimo(): number {
    return this.stockCritico * FACTOR_STOCK_MINIMO;
  }

  isSinStock(): boolean {
    return this.stockActual <= 0;
  }

  isStockCritico(): boolean {
    return this.stockActual > 0 && this.stockActual <= this.stockCritico;
  }

  isStockBajo(): boolean {
    return this.stockActual > this.stockCritico && this.stockActual <= this.stockMinimo;
  }

  getNivelStock(): NivelStock {
    if (this.isSinStock()) return 'SIN_STOCK';
    if (this.isStockCritico()) return 'CRITICO';
    if (this.isStockBajo()) return 'BAJO';
    return 'NORMAL';
  }

  validar(): string[] {
    const errores: string[] = [];

    if (!this.nombre || this.nombre.trim().length === 0) {
      errores.push('El nombre es requerido');
    }

    if (!this.unidad || this.unidad.trim().length === 0) {
      errores.push('La unidad es requerida');
    }

    if (this.stockCritico < 0) {
      errores.push('El stock crítico no puede ser negativo');
    }

    return errores;
  }
}
