import api from './client';
import type {
  ProductoInventario,
  Lote,
  MovimientoStock,
  PaginatedResponse,
  AlertaStockCritico,
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

export async function getProducto(id: string): Promise<ProductoInventario> {
  const res = await api.get(`/inventario/${id}`);
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

export async function getAlertasStockCritico(): Promise<AlertaStockCritico[]> {
  const res = await api.get('/alertas/stock-critico');
  return res.data.data;
}
