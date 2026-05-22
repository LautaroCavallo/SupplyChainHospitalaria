import api from './client';
import type { Proveedor, PaginatedResponse } from '../types';

interface ProveedorParams {
  page?: number;
  limit?: number;
  busqueda?: string;
}

export async function getProveedores(
  params: ProveedorParams
): Promise<PaginatedResponse<Proveedor>> {
  const res = await api.get('/proveedores', { params });
  return res.data;
}

export async function crearProveedor(
  data: Omit<Proveedor, 'id' | 'createdAt' | 'updatedAt' | 'activo'>
): Promise<Proveedor> {
  const res = await api.post('/proveedores', data);
  return res.data.data;
}

export async function actualizarProveedor(
  id: string,
  data: Partial<Omit<Proveedor, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Proveedor> {
  const res = await api.put(`/proveedores/${id}`, data);
  return res.data.data;
}

export async function getProveedor(id: string): Promise<Proveedor> {
  const res = await api.get(`/proveedores/${id}`);
  return res.data.data;
}

export async function eliminarProveedor(id: string): Promise<void> {
  await api.delete(`/proveedores/${id}`);
}
