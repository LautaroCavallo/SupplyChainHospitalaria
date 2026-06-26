// ─── Enums ────────────────────────────────────────────────────────────────────

export type NivelStock = 'NORMAL' | 'BAJO' | 'CRITICO' | 'SIN_STOCK';

export type CategoriaProducto =
  | 'MEDICAMENTO'
  | 'INSUMO_MEDICO'
  | 'DESCARTABLE'
  | 'REACTIVO'
  | 'OTRO';

export type EstadoLote = 'VIGENTE' | 'PROXIMO_A_VENCER' | 'VENCIDO' | 'AGOTADO';

export type EstadoRecepcion = 'BORRADOR' | 'CONFIRMADA' | 'PROCESADA';

export type TipoMovimiento =
  | 'INGRESO'
  | 'EGRESO'
  | 'AJUSTE_POSITIVO'
  | 'AJUSTE_NEGATIVO'
  | 'CONSUMO_RECETA';

export type EstadoSolicitud = 'BORRADOR' | 'PENDIENTE' | 'APROBADA' | 'EN_RECEPCION' | 'RECHAZADA' | 'ENVIADA';
export type PrioridadSolicitud = 'BAJA' | 'NORMAL' | 'ALTA' | 'URGENTE';

export type TipoDeposito = 'CENTRAL' | 'PISO';

export interface Deposito {
  id: string;
  nombre: string;
  tipo: TipoDeposito;
  descripcion?: string;
  activo: boolean;
}

export interface StockPorDeposito {
  depositoId: string;
  depositoNombre: string;
  depositoTipo: TipoDeposito;
  stock: number;
}

// ─── Inventario ───────────────────────────────────────────────────────────────

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
  genericoId?: string;
  generico?: {
    id: string;
    nombre: string;
    principioActivo: string;
    dosis?: string | null;
    formaFarmaceutica?: string | null;
  } | null;
  laboratorio?: string;
  precio?: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  nivelStock?: NivelStock;
  proveedor?: Proveedor;
}

export interface InventarioSummary {
  totalProductos: number;
  alertaBajoStock: number;
  sinStock: number;
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

export interface MovimientoLote {
  id: string;
  loteId: string;
  productoId: string;
  tipo: TipoMovimiento;
  cantidad: number;
  origen?: string;
  destino?: string;
  motivo?: string;
  responsable?: string;
  createdAt: string;
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

// ─── Proveedores ──────────────────────────────────────────────────────────────

export interface Proveedor {
  id: string;
  razonSocial: string;
  cuit: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  plazoPago?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProveedorPayload = Omit<Proveedor, 'id' | 'createdAt' | 'updatedAt'>;

// ─── Recepciones ──────────────────────────────────────────────────────────────

export interface RecepcionDetalle {
  id?: string;
  recepcionId?: string;
  productoId: string;
  cantidad: number;
  ean?: string;
  troquel?: string;
  lote?: string;
  fechaVencimiento?: string;
  laboratorio?: string;
  producto?: ProductoInventario;
}

export interface Recepcion {
  id: string;
  proveedorId: string;
  solicitudCompraId?: string;
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
  solicitudCompra?: SolicitudCompra;
}

// ─── Solicitudes de Compra ────────────────────────────────────────────────────

export interface SolicitudCompraDetalle {
  id?: string;
  solicitudId?: string;
  productoId: string;
  nombreProducto?: string;
  proveedorId?: string;
  nombreProveedor?: string;
  motivo?: string;
  stockActual?: number;
  stockMinimo?: number;
  cantidadSolicitada: number;
  cantidadAprobada?: number;
  unidad?: string;
  precioUnitario?: number;
  producto?: { id: string; nombre: string; stockActual?: number; stockMinimo?: number };
}

export interface SolicitudCompra {
  id: string;
  estado: EstadoSolicitud;
  prioridad: PrioridadSolicitud;
  motivo?: string;
  observaciones?: string;
  fechaSolicitud?: string;
  proveedorNombre?: string;
  usuarioId?: string;
  detalles: SolicitudCompraDetalle[];
  createdAt: string;
  updatedAt: string;
  // Campos OC
  ordenCompraId?: string;
  ordenCompraExternaId?: string;
  referenciaExterna?: string;
  proveedorSugeridoId?: string;
  proveedorSugerido?: { id: string; razonSocial: string; cuit: string };
  proveedorAdjudicadoRazonSocial?: string;
  fechaAprobacion?: string;
  fechaEntregaEstimada?: string;
  recepcion?: { id: string; estado: EstadoRecepcion } | null;
}

export type CompraCreatePayload = {
  estado?: string;
  fechaSolicitud?: string;
  observaciones?: string;
  prioridad?: string;
  motivo?: string;
  proveedorSugeridoId?: string;
  detalles: Omit<SolicitudCompraDetalle, 'id' | 'solicitudId'>[];
};

// ─── Alertas ──────────────────────────────────────────────────────────────────

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
  proveedorNombre?: string;
}

// ─── Medicamentos (catálogo) ──────────────────────────────────────────────────

export interface MedicamentoListItem {
  id: string;
  nombre: string;
  categoria: string;
  presentacion?: string;
  ean?: string;
  laboratorio?: string;
  estado: 'ACTIVO' | 'INACTIVO';
  precio?: number;
  observaciones?: string;
  stockCritico?: number;
  stockMinimo?: number;
}

export interface MedicamentosSummary {
  total: number;
  activos: number;
  inactivos: number;
}

export interface MedicamentoVademecum {
  id: string;
  nombre: string;
  principioActivo?: string;
  presentacion?: string;
  ean?: string;
  troquel?: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  recetasValidadas: number;
  medicamentosCriticos: number;
  actividadReciente: number;
}

export interface ActividadReciente {
  id: string;
  evento: string;
  tipoEvento: 'receta_validada' | 'stock_ajustado' | 'nueva_recepcion' | 'validacion_rechazada' | 'otro';
  referencia?: string;
  producto?: string;
  hora: string;
  responsable: string;
  createdAt: string;
}

// ─── Pacientes / Recetas ──────────────────────────────────────────────────────

export interface RecetaItem {
  medicamento: string;
  descripcion?: string;
  cantAutorizada: number;
  cantConsumida: number;
}

export interface RecetaDetalle {
  id: string;
  paciente: string;
  fecha: string;
  estado: 'Activa' | 'Consumida' | 'Vencida';
  consumida: boolean;
  valida: boolean;
  errores?: string[];
  medicoNombre: string;
  medicoMatricula: string;
  medicoEspecialidad: string;
  items: RecetaItem[];
}

// ─── Notificaciones ───────────────────────────────────────────────────────────

export type TipoNotificacion =
  | 'stock_critico'
  | 'receta_validada'
  | 'nueva_recepcion'
  | 'lote_por_vencer';

export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  descripcion: string;
  leida: boolean;
  createdAt: string;
}

// ─── Perfil ───────────────────────────────────────────────────────────────────

export interface PerfilUsuario {
  id: string;
  nombreCompleto: string;
  email: string;
  telefono?: string;
  documento?: string;
  cargo: string;
  especialidad?: string;
  institucion?: string;
  matricula?: string;
  estado: 'ACTIVO' | 'INACTIVO';
  avatarUrl?: string;
  notifAlertasStock: boolean;
  notifNuevosProtocolos: boolean;
}

export type PerfilUpdatePayload = Partial<Omit<PerfilUsuario, 'id'>>;

// ─── Paginación ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
