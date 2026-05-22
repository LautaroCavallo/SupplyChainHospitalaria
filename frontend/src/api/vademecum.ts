import api from './client';
import type { MedicamentoVademecum } from '../types';

export async function buscarMedicamentos(
  q: string
): Promise<MedicamentoVademecum[]> {
  const res = await api.get('/vademecum/search', { params: { q } });
  return res.data.data;
}
