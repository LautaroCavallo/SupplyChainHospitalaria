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
  try {
    const res = await api.get('/medicamentos', { params });
    return res.data;
  } catch {
    const mock: MedicamentoListItem[] = [
      { id: '1', nombre: 'Paracetamol 500mg', categoria: 'Analgésicos', presentacion: 'Comprimidos x 20', ean: '7791234567890', laboratorio: 'PharmaCore', estado: 'ACTIVO' },
      { id: '2', nombre: 'Amoxicilina 1g', categoria: 'Antibióticos', presentacion: 'Sobres x 16', ean: '7790987654321', laboratorio: 'NaturaPharma', estado: 'ACTIVO' },
      { id: '3', nombre: 'Jarabe Infantil Calmo', categoria: 'Jarabe', presentacion: 'Frasco 120ml', ean: '7795544332211', laboratorio: 'PharmaCore', estado: 'INACTIVO' },
    ];
    return { data: mock, total: 1284, page: 1, limit: 10, totalPages: 129 };
  }
}

export async function getMedicamentosSummary(): Promise<MedicamentosSummary> {
  try {
    const res = await api.get('/medicamentos/summary');
    return res.data.data ?? res.data;
  } catch {
    return { total: 1284, activos: 1240, inactivos: 48 };
  }
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
