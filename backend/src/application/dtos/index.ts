export interface PaginacionDTO {
  page: number;
  limit: number;
}

export interface ResultadoPaginadoDTO<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CrearProveedorDTO {
  razonSocial: string;
  cuit: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
}

export interface ActualizarProveedorDTO {
  razonSocial?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  activo?: boolean;
}

export interface ProveedorResponseDTO {
  id: string;
  razonSocial: string;
  cuit: string;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  contacto?: string | null;
  activo: boolean;
  createdAt: Date;
}

export interface FiltroProveedorDTO extends PaginacionDTO {
  busqueda?: string;
  activo?: boolean;
}

export interface FiltroInventarioDTO extends PaginacionDTO {
  busqueda?: string;
  categoria?: string;
  estado?: string;
}

export interface ProductoInventarioResponseDTO {
  id: string;
  nombre: string;
  descripcion?: string | null;
  principioActivo?: string | null;
  presentacion?: string | null;
  categoria: string;
  ean?: string | null;
  troquel?: string | null;
  stockActual: number;
  stockMinimo: number;
  stockCritico: number;
  unidad: string;
  proveedor?: { id: string; razonSocial: string } | null;
  estado?: string;
  activo: boolean;
}

export interface AjusteStockDTO {
  tipo: 'INCREMENTO' | 'DECREMENTO';
  cantidad: number;
  motivo: string;
  loteId?: string;
}

export interface LoteResponseDTO {
  id: string;
  numeroLote: string;
  productoId: string;
  fechaVencimiento: Date;
  stockDisponible: number;
  stockInicial: number;
  estado: string;
}

export interface MovimientoResponseDTO {
  id: string;
  productoId: string;
  loteId?: string | null;
  tipo: string;
  cantidad: number;
  motivo: string;
  referencia?: string | null;
  createdAt: Date;
}

export interface CrearRecepcionDTO {
  proveedorId: string;
  remito?: string;
  fechaRecepcion: string;
  observaciones?: string;
  detalles: CrearRecepcionDetalleDTO[];
}

export interface CrearRecepcionDetalleDTO {
  productoId: string;
  cantidad: number;
  ean?: string;
  troquel?: string;
  lote: string;
  fechaVencimiento: string;
}

export interface RecepcionResponseDTO {
  id: string;
  proveedorId: string;
  proveedor?: { id: string; razonSocial: string };
  remito?: string | null;
  fechaRecepcion: Date;
  estado: string;
  observaciones?: string | null;
  totalItems: number;
  detalles: RecepcionDetalleResponseDTO[];
  createdAt: Date;
}

export interface RecepcionDetalleResponseDTO {
  id: string;
  productoId: string;
  producto?: { id: string; nombre: string };
  cantidad: number;
  ean?: string | null;
  troquel?: string | null;
  lote: string;
  fechaVencimiento: Date;
}

export interface FiltroRecepcionDTO extends PaginacionDTO {
  estado?: string;
  proveedorId?: string;
}

export interface CrearSolicitudCompraDTO {
  prioridad?: string;
  motivo?: string;
  detalles: { productoId: string; cantidadSolicitada: number }[];
}

export interface SolicitudCompraResponseDTO {
  id: string;
  estado: string;
  prioridad: string;
  motivo?: string | null;
  detalles: {
    id: string;
    productoId: string;
    producto?: { id: string; nombre: string };
    cantidadSolicitada: number;
    cantidadAprobada?: number | null;
  }[];
  createdAt: Date;
}

export interface AlertaStockDTO {
  id: string;
  productoId: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  stockCritico: number;
  nivel: string;
  categoria: string;
}

export interface MedicamentoVademecumDTO {
  id: string;
  nombre: string;
  principioActivo: string;
  presentacion: string;
  laboratorio: string;
  precio?: number;
  ean?: string;
  troquel?: string;
}
