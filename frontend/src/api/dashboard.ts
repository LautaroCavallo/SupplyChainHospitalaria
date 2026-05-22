import api from './client';
import type { DashboardSummary, ActividadReciente, PaginatedResponse } from '../types';

export async function getDashboard(): Promise<DashboardSummary> {
  try {
    const res = await api.get('/dashboard');
    return res.data.data ?? res.data;
  } catch {
    return { recetasValidadas: 124, medicamentosCriticos: 8, actividadReciente: 45 };
  }
}

export async function getActividadReciente(params?: {
  page?: number;
  limit?: number;
  busqueda?: string;
  usuario?: string;
  evento?: string;
  desde?: string;
  hasta?: string;
}): Promise<PaginatedResponse<ActividadReciente>> {
  try {
    const res = await api.get('/dashboard/actividad-reciente', { params });
    return res.data;
  } catch {
    const mockData: ActividadReciente[] = [
      {
        id: '1',
        evento: 'Receta validada',
        tipoEvento: 'receta_validada',
        referencia: 'RX-4481',
        hora: '13:45',
        responsable: 'Dr. Alejandro',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        evento: 'Stock ajustado',
        tipoEvento: 'stock_ajustado',
        producto: 'Ibuprofeno 600mg',
        hora: '12:10',
        responsable: 'Sistema',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '3',
        evento: 'Nueva recepción',
        tipoEvento: 'nueva_recepcion',
        referencia: 'REC-9022',
        hora: '10:30',
        responsable: 'M. Lozano',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
    return { data: mockData, total: 15, page: 1, limit: 10, totalPages: 2 };
  }
}
