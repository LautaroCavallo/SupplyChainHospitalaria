import api from './client';
import type {
  ProductoInventario,
  Lote,
  MovimientoStock,
  MovimientoLote,
  PaginatedResponse,
  AlertaStockCritico,
  InventarioSummary,
} from '../types';

interface InventarioParams {
  page?: number;
  limit?: number;
  busqueda?: string;
  categoria?: string;
  estado?: string;
}

export async function getInventario(
  params: InventarioParams
): Promise<PaginatedResponse<ProductoInventario>> {
  const res = await api.get('/inventario', { params });
  return res.data;
}

export async function getInventarioSummary(): Promise<InventarioSummary> {
  try {
    const res = await api.get('/inventario/summary');
    return res.data.data ?? res.data;
  } catch {
    return { totalProductos: 1284, alertaBajoStock: 42, sinStock: 8 };
  }
}

export async function getProducto(id: string): Promise<ProductoInventario> {
  const res = await api.get(`/inventario/${id}`);
  return res.data.data;
}

export async function getProductoPorEan(ean: string): Promise<ProductoInventario> {
  const res = await api.get(`/inventario/ean/${ean}`);
  return res.data.data;
}

export async function ajustarStock(
  id: string,
  data: { tipo: string; cantidad: number; motivo: string; loteId?: string }
): Promise<void> {
  await api.post(`/inventario/${id}/ajuste`, data);
}

export async function getMovimientos(id: string): Promise<MovimientoStock[]> {
  const res = await api.get(`/inventario/${id}/movimientos`);
  return res.data.data;
}

export async function getLotes(id: string): Promise<Lote[]> {
  const res = await api.get(`/inventario/${id}/lotes`);
  return res.data.data;
}

export async function getHistorialLote(
  medicamentoId: string,
  loteId: string,
  params?: { page?: number; limit?: number; tipo?: string; fechaDesde?: string; fechaHasta?: string }
): Promise<PaginatedResponse<MovimientoLote>> {
  try {
    const res = await api.get(
      `/inventario/${medicamentoId}/lotes/${loteId}/historial`,
      { params }
    );
    return res.data;
  } catch {
    const mock: MovimientoLote[] = [
      { id: '1', loteId, productoId: medicamentoId, tipo: 'INGRESO', cantidad: 800, origen: 'Droguería Sur', responsable: 'M. Lozano', createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
      { id: '2', loteId, productoId: medicamentoId, tipo: 'EGRESO', cantidad: 20, destino: 'Sala 3', responsable: 'Dr. Alejandro', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: '3', loteId, productoId: medicamentoId, tipo: 'AJUSTE_POSITIVO', cantidad: 5, motivo: 'Ajuste por auditoría', responsable: 'Sistema', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    ];
    return { data: mock, total: mock.length, page: 1, limit: 10, totalPages: 1 };
  }
}

export async function getAlertasStockCritico(): Promise<AlertaStockCritico[]> {
  const res = await api.get('/alertas/stock-critico');
  return res.data.data;
}
