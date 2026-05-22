export type NivelStock = 'NORMAL' | 'BAJO' | 'CRITICO' | 'SIN_STOCK';

export type CategoriaProducto =
  | 'MEDICAMENTO'
  | 'INSUMO_MEDICO'
  | 'DESCARTABLE'
  | 'REACTIVO'
  | 'OTRO';

export type EstadoLote = 'VIGENTE' | 'PROXIMO_A_VENCER' | 'VENCIDO';

export type EstadoRecepcion = 'BORRADOR' | 'CONFIRMADA' | 'PROCESADA';

export type TipoMovimiento =
  | 'INGRESO'
  | 'EGRESO'
  | 'AJUSTE_POSITIVO'
  | 'AJUSTE_NEGATIVO'
  | 'CONSUMO_RECETA';

export type EstadoSolicitud = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'ENVIADA';
export type PrioridadSolicitud = 'BAJA' | 'NORMAL' | 'ALTA' | 'URGENTE';

export interface ProductoInventario {
  id: string;
  nombre: string;
  descripcion?: string;
  principioActivo?: string;
  presentacion?: string;
  categoria: CategoriaProducto;
  ean?: string;
  troquel?: string;
  stockActual: number;
  stockMinimo: number;
  stockCritico: number;
  unidad: string;
  proveedorId?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  nivelStock?: NivelStock;
  proveedor?: Proveedor;
}

export interface Lote {
  id: string;
  numeroLote: string;
  productoId: string;
  fechaVencimiento: string;
  stockDisponible: number;
  stockInicial: number;
  estado: EstadoLote;
  createdAt: string;
  updatedAt: string;
}

export interface Proveedor {
  id: string;
  razonSocial: string;
  cuit: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecepcionDetalle {
  id?: string;
  recepcionId?: string;
  productoId: string;
  cantidad: number;
  ean?: string;
  troquel?: string;
  lote: string;
  fechaVencimiento: string;
  producto?: ProductoInventario;
}

export interface Recepcion {
  id: string;
  proveedorId: string;
  remito?: string;
  fechaRecepcion: string;
  estado: EstadoRecepcion;
  observaciones?: string;
  usuarioId?: string;
  totalItems: number;
  detalles: RecepcionDetalle[];
  createdAt: string;
  updatedAt: string;
  proveedor?: Proveedor;
}

export interface MovimientoStock {
  id: string;
  productoId: string;
  loteId?: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo: string;
  referencia?: string;
  usuarioId?: string;
  createdAt: string;
}

export interface SolicitudCompraDetalle {
  id?: string;
  solicitudId?: string;
  productoId: string;
  cantidadSolicitada: number;
  cantidadAprobada?: number;
}

export interface SolicitudCompra {
  id: string;
  estado: EstadoSolicitud;
  prioridad: PrioridadSolicitud;
  motivo?: string;
  usuarioId?: string;
  detalles: SolicitudCompraDetalle[];
  createdAt: string;
  updatedAt: string;
}

export interface AlertaStockCritico {
  id: string;
  productoId: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  stockCritico: number;
  nivel: NivelStock;
  categoria: CategoriaProducto;
  unidad?: string;
}

export interface MedicamentoVademecum {
  id: string;
  nombre: string;
  principioActivo?: string;
  presentacion?: string;
  ean?: string;
  troquel?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
