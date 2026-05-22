import api from './client';
import type { Recepcion, RecepcionDetalle, PaginatedResponse } from '../types';

interface RecepcionesParams {
  page?: number;
  limit?: number;
  estado?: string;
}

export interface CrearRecepcionPayload {
  proveedorId: string;
  remito?: string;
  fechaRecepcion: string;
  observaciones?: string;
  detalles: Omit<RecepcionDetalle, 'id' | 'recepcionId' | 'producto'>[];
}

export async function getRecepciones(
  params: RecepcionesParams
): Promise<PaginatedResponse<Recepcion>> {
  const res = await api.get('/recepciones', { params });
  return res.data;
}

export async function getRecepcion(id: string): Promise<Recepcion> {
  const res = await api.get(`/recepciones/${id}`);
  return res.data.data;
}

export async function crearRecepcion(
  data: CrearRecepcionPayload
): Promise<Recepcion> {
  const res = await api.post('/recepciones', data);
  return res.data.data;
}

export async function confirmarRecepcion(id: string): Promise<Recepcion> {
  const res = await api.put(`/recepciones/${id}/confirmar`);
  return res.data.data;
}

export async function procesarRecepcion(id: string): Promise<Recepcion> {
  const res = await api.put(`/recepciones/${id}/procesar`);
  return res.data.data;
}
