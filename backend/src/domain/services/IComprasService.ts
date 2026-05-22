export interface SolicitudCompraExterna {
  solicitudId: string;
  prioridad: 'BAJA' | 'NORMAL' | 'ALTA' | 'URGENTE';
  items: ItemSolicitudExterna[];
  observaciones?: string;
  solicitanteId?: string;
}

export interface ItemSolicitudExterna {
  productoId: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  especificaciones?: string;
}

export interface ResultadoEnvio {
  exitoso: boolean;
  solicitudExternaId?: string;
  mensaje: string;
  errores: string[];
}

export interface IComprasService {
  enviarSolicitud(solicitud: SolicitudCompraExterna): Promise<ResultadoEnvio>;
}
