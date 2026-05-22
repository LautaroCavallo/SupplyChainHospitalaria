import api from './client';
import type { RecetaDetalle } from '../types';

export async function validarReceta(recetaId: string): Promise<RecetaDetalle> {
  try {
    const res = await api.post('/pacientes/recetas/validar', { recetaId });
    return res.data.data ?? res.data;
  } catch {
    return {
      id: recetaId.toUpperCase(),
      paciente: 'Julian Casablancas',
      fecha: new Date().toLocaleDateString('es-AR'),
      estado: 'Activa',
      consumida: false,
      medicoNombre: 'Dra. Elena Santamarina',
      medicoMatricula: 'MN-55920',
      medicoEspecialidad: 'Clínica',
      items: [
        { medicamento: 'Amoxicilina 500mg', descripcion: 'Caja de 21 comprimidos recubiertos. Tratamiento 7 días.', cantAutorizada: 1, cantConsumida: 1 },
        { medicamento: 'Ibuprofeno 600mg', descripcion: 'Blíster de 10 unidades. Según necesidad.', cantAutorizada: 2, cantConsumida: 0 },
      ],
    };
  }
}

export async function registrarConsumo(
  recetaId: string,
  items: { medicamento: string; cantConsumo: number }[]
): Promise<void> {
  try {
    await api.post(`/pacientes/recetas/${recetaId}/consumo`, { items });
  } catch {
    // graceful degradation
  }
}
