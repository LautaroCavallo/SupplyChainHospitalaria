import api from './client';
import type { RecetaDetalle } from '../types';

export async function validarReceta(recetaId: string): Promise<RecetaDetalle> {
  const res = await api.post(`/recetas/${recetaId}/validar`);
  const data = res.data.data ?? res.data;
  return {
    id: data.recetaId,
    paciente: data.pacienteNombre,
    fecha: new Date().toLocaleDateString('es-AR'),
    estado: data.valida ? 'Activa' : 'Vencida',
    consumida: false,
    medicoNombre: data.medicoNombre,
    medicoMatricula: data.medicoId,
    medicoEspecialidad: 'Clínica',
    items: data.items.map((item: any) => ({
      medicamento: item.medicamento ?? item.nombre,
      descripcion: item.indicaciones ?? 'Medicamento genérico prescripto',
      cantAutorizada: item.cantidad,
      cantConsumida: 0,
    })),
  };
}

export async function registrarConsumo(
  recetaId: string,
  items: { medicamento: string; cantConsumo: number }[]
): Promise<void> {
  await api.post(`/recetas/${recetaId}/consumir`, { items });
}
