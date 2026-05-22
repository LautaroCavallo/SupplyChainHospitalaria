import api from './client';
import type { SolicitudCompra, SolicitudCompraDetalle } from '../types';

export interface CrearSolicitudPayload {
  prioridad?: string;
  motivo?: string;
  detalles: Omit<SolicitudCompraDetalle, 'id' | 'solicitudId'>[];
}

export async function crearSolicitud(
  data: CrearSolicitudPayload
): Promise<SolicitudCompra> {
  const res = await api.post('/solicitudes-compra', data);
  return res.data.data;
}

export async function getSolicitudes(): Promise<SolicitudCompra[]> {
  const res = await api.get('/solicitudes-compra');
  return res.data.data;
}
