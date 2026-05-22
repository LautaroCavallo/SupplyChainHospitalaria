import api from './client';
import type { SolicitudCompra, CompraCreatePayload, AlertaStockCritico, PaginatedResponse } from '../types';

export async function getCompras(params?: {
  page?: number;
  limit?: number;
  estado?: string;
}): Promise<PaginatedResponse<SolicitudCompra>> {
  try {
    const res = await api.get('/solicitudes-compra', { params });
    const raw = res.data;
    if (Array.isArray(raw.data)) return raw;
    if (Array.isArray(raw)) {
      return { data: raw, total: raw.length, page: 1, limit: raw.length, totalPages: 1 };
    }
    return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  } catch {
    const mock: SolicitudCompra[] = [
      { id: '#SC-2023-0892', estado: 'APROBADA', prioridad: 'NORMAL', proveedorNombre: 'Laboratorio Central S.A.', fechaSolicitud: '24 Oct 2023', detalles: Array(14).fill({ productoId: '', cantidadSolicitada: 1 }), createdAt: '2023-10-24', updatedAt: '2023-10-24' },
      { id: '#SC-2023-0889', estado: 'PENDIENTE', prioridad: 'ALTA', proveedorNombre: 'Global Medical Supplies', fechaSolicitud: '22 Oct 2023', detalles: Array(8).fill({ productoId: '', cantidadSolicitada: 1 }), createdAt: '2023-10-22', updatedAt: '2023-10-22' },
      { id: '#SC-2023-0885', estado: 'ENVIADA', prioridad: 'NORMAL', proveedorNombre: 'PharmaDirect Logística', fechaSolicitud: '19 Oct 2023', detalles: Array(32).fill({ productoId: '', cantidadSolicitada: 1 }), createdAt: '2023-10-19', updatedAt: '2023-10-19' },
    ];
    return { data: mock, total: 284, page: 1, limit: 10, totalPages: 29 };
  }
}

export async function getCompra(id: string): Promise<SolicitudCompra> {
  try {
    const res = await api.get(`/solicitudes-compra/${id}`);
    return res.data.data ?? res.data;
  } catch {
    throw new Error('Solicitud no encontrada');
  }
}

export async function crearCompra(data: CompraCreatePayload): Promise<SolicitudCompra> {
  try {
    const res = await api.post('/solicitudes-compra', data);
    return res.data.data ?? res.data;
  } catch {
    throw new Error('Error al crear solicitud');
  }
}

export async function getAlertasCompras(): Promise<AlertaStockCritico[]> {
  try {
    const res = await api.get('/alertas/stock-critico');
    return res.data.data ?? res.data;
  } catch {
    return [
      { id: '1', productoId: '1', nombre: 'Amoxicilina 500mg', stockActual: 55, stockMinimo: 50, stockCritico: 20, nivel: 'BAJO', categoria: 'MEDICAMENTO', proveedorNombre: 'Laboratorio Central S.A.' },
      { id: '2', productoId: '2', nombre: 'Insulina Humana', stockActual: 30, stockMinimo: 20, stockCritico: 10, nivel: 'BAJO', categoria: 'MEDICAMENTO', proveedorNombre: 'Biogenetics Pharm' },
      { id: '3', productoId: '3', nombre: 'Paracetamol 1g', stockActual: 120, stockMinimo: 100, stockCritico: 50, nivel: 'BAJO', categoria: 'MEDICAMENTO', proveedorNombre: 'MediGlobal Distribuidora' },
    ];
  }
}
