import api from './client';
import type { Notificacion } from '../types';

export async function getNotificaciones(): Promise<Notificacion[]> {
  const res = await api.get('/notificaciones');
  return res.data.data ?? res.data;
}

export async function marcarLeidas(): Promise<void> {
  await api.post('/notificaciones/marcar-leidas');
}
