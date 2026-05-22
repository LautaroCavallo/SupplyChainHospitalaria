import api from './client';
import type { PerfilUsuario, PerfilUpdatePayload } from '../types';

export async function getPerfil(): Promise<PerfilUsuario> {
  try {
    const res = await api.get('/perfil');
    return res.data.data ?? res.data;
  } catch {
    return {
      id: '1',
      nombreCompleto: 'Alejandro Villalobos',
      email: 'a.villalobos@clinicasanctuary.com',
      telefono: '+54 9 11 4455-6677',
      documento: '28.441.229',
      cargo: 'Farmacéutico Jefe',
      especialidad: 'Farmacia Clínica y Hospitalaria',
      institucion: 'Clinical Sanctuary - Central',
      matricula: 'MP-9384-C',
      estado: 'ACTIVO',
      notifAlertasStock: true,
      notifNuevosProtocolos: true,
    };
  }
}

export async function actualizarPerfil(data: PerfilUpdatePayload): Promise<PerfilUsuario> {
  try {
    const res = await api.put('/perfil', data);
    return res.data.data ?? res.data;
  } catch {
    throw new Error('Error al actualizar perfil');
  }
}
