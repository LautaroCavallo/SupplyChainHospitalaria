import api from './client';
import type { Deposito, StockPorDeposito, TipoDeposito } from '../types';

export async function getDepositos(soloActivos = false): Promise<Deposito[]> {
  const res = await api.get('/depositos', { params: soloActivos ? { activos: true } : {} });
  return res.data.data ?? res.data;
}

export async function crearDeposito(data: {
  nombre: string;
  tipo?: TipoDeposito;
  descripcion?: string;
}): Promise<Deposito> {
  const res = await api.post('/depositos', data);
  return res.data.data ?? res.data;
}

export async function getStockPorDeposito(productoId: string): Promise<StockPorDeposito[]> {
  const res = await api.get(`/depositos/stock/${productoId}`);
  return res.data.data ?? res.data;
}

export async function transferirStock(data: {
  productoId: string;
  depositoOrigenId: string;
  depositoDestinoId: string;
  cantidad: number;
}): Promise<{ unidadesTransferidas: number }> {
  const res = await api.post('/depositos/transferencias', data);
  return res.data;
}
