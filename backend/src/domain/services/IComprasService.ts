export interface OrdenCompraPayload {
  ordenCompraId: string;
  solicitudCompraId: string;
  prioridad: 'BAJA' | 'NORMAL' | 'ALTA' | 'URGENTE';
  proveedorSugerido?: { id: string; razonSocial: string; cuit: string };
  items: {
    productoId: string;
    nombre: string;
    cantidad: number;
    unidad: string;
    especificaciones?: string;
  }[];
  motivo?: string;
  fechaGeneracion: string;
  callbackUrl: string;
}

export interface AdjudicacionCallbackDTO {
  aprobado: boolean;
  referenciaExterna?: string;
  proveedorAdjudicado?: { razonSocial: string };
  itemsAdjudicados?: {
    productoId: string;
    cantidadAprobada: number;
    precioUnitario: number;
  }[];
  fechaAprobacion?: string;
  fechaEntregaEstimada?: string;
  observaciones?: string;
}

export interface ResultadoEnvio {
  exitoso: boolean;
  ordenCompraExternaId?: string;
  mensaje: string;
  errores: string[];
  autoCallback?: AdjudicacionCallbackDTO;
}

export interface IComprasService {
  enviarOrdenCompra(payload: OrdenCompraPayload): Promise<ResultadoEnvio>;
}
