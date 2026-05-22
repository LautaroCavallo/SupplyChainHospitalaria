import api from './client';
import type { Notificacion } from '../types';

export async function getNotificaciones(): Promise<Notificacion[]> {
  try {
    const res = await api.get('/notificaciones');
    return res.data.data ?? res.data;
  } catch {
    return [
      { id: '1', tipo: 'stock_critico', titulo: 'Stock crítico: Amoxicilina 500mg', descripcion: 'El stock ha caído por debajo del mínimo (55 uds).', leida: false, createdAt: new Date(Date.now() - 600000).toISOString() },
      { id: '2', tipo: 'receta_validada', titulo: 'Receta validada: RX-4481', descripcion: 'La receta fue validada correctamente.', leida: false, createdAt: new Date(Date.now() - 1800000).toISOString() },
      { id: '3', tipo: 'nueva_recepcion', titulo: 'Nueva recepción: REC-9022', descripcion: 'Se registró una nueva recepción de Droguería Sur.', leida: true, createdAt: new Date(Date.now() - 7200000).toISOString() },
      { id: '4', tipo: 'lote_por_vencer', titulo: 'Lote próximo a vencer', descripcion: 'El lote 2311B de Amoxicilina vence en 30 días.', leida: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
    ];
  }
}

export async function marcarLeidas(): Promise<void> {
  try {
    await api.post('/notificaciones/marcar-leidas');
  } catch {
    // graceful degradation
  }
}
