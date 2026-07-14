import api from './client';
import type { PerfilUsuario, PerfilUpdatePayload } from '../types';

const USER_KEY = 'healthgrid_user';
const PERFIL_KEY = 'healthgrid_perfil';

function getBaseUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
}

function getStoredPerfil() {
  try { return JSON.parse(localStorage.getItem(PERFIL_KEY) || 'null'); } catch { return null; }
}

function buildPerfilFromStorage(): PerfilUsuario {
  const user = getBaseUser();
  const extra = getStoredPerfil();
  return {
    id: user?.id ?? '1',
    nombreCompleto: extra?.nombreCompleto ?? user?.nombre ?? 'Usuario',
    email: extra?.email ?? user?.email ?? '',
    telefono: extra?.telefono,
    documento: extra?.documento,
    cargo: extra?.cargo ?? user?.cargo ?? 'Farmacéutico',
    especialidad: extra?.especialidad,
    institucion: extra?.institucion,
    matricula: extra?.matricula,
    estado: 'ACTIVO',
    notifAlertasStock: extra?.notifAlertasStock ?? true,
    notifNuevosProtocolos: extra?.notifNuevosProtocolos ?? true,
  };
}

export async function getPerfil(): Promise<PerfilUsuario> {
  try {
    const res = await api.get('/perfil');
    return res.data.data ?? res.data;
  } catch {
    return buildPerfilFromStorage();
  }
}

export async function actualizarPerfil(data: PerfilUpdatePayload): Promise<PerfilUsuario> {
  try {
    const res = await api.put('/perfil', data);
    return res.data.data ?? res.data;
  } catch {
    // Persistir en localStorage
    const current = getStoredPerfil() ?? {};
    localStorage.setItem(PERFIL_KEY, JSON.stringify({ ...current, ...data }));

    // Actualizar nombre en healthgrid_user si cambió
    const user = getBaseUser();
    if (user && data.nombreCompleto) {
      user.nombre = data.nombreCompleto;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    return buildPerfilFromStorage();
  }
}
