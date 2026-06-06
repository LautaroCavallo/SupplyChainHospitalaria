import api from './client';
import type { MedicamentoListItem, MedicamentosSummary, PaginatedResponse } from '../types';

interface MedicamentosParams {
  page?: number;
  limit?: number;
  busqueda?: string;
  categoria?: string;
  estado?: string;
}

export async function getMedicamentos(
  params: MedicamentosParams
): Promise<PaginatedResponse<MedicamentoListItem>> {
  const res = await api.get('/medicamentos', { params });
  return res.data;
}

export async function getMedicamentosSummary(): Promise<MedicamentosSummary> {
  const res = await api.get('/medicamentos/summary');
  return res.data.data ?? res.data;
}

export async function crearMedicamento(
  data: Omit<MedicamentoListItem, 'id'>
): Promise<MedicamentoListItem> {
  const res = await api.post('/medicamentos', data);
  return res.data.data;
}

export async function actualizarMedicamento(
  id: string,
  data: Partial<MedicamentoListItem>
): Promise<MedicamentoListItem> {
  const res = await api.put(`/medicamentos/${id}`, data);
  return res.data.data;
}

export async function eliminarMedicamento(id: string): Promise<void> {
  await api.delete(`/medicamentos/${id}`);
}
