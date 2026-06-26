import api from './client';
import type { RecetaDetalle } from '../types';

export async function validarReceta(recetaId: string): Promise<RecetaDetalle> {
  const res = await api.post(`/recetas/${recetaId}/validar`);
  const data = res.data.data ?? res.data;
  return {
    id: data.recetaId,
    paciente: data.pacienteNombre,
    fecha: new Date().toLocaleDateString('es-AR'),
    estado: data.estado ?? (data.valida ? 'Activa' : 'Vencida'),
    consumida: data.consumida ?? false,
    valida: data.valida ?? false,
    errores: data.errores ?? [],
    medicoNombre: data.medicoNombre,
    medicoMatricula: data.medicoId,
    medicoEspecialidad: 'Clínica',
    items: data.items.map((item: any) => ({
      medicamento: item.medicamento ?? item.nombre,
      descripcion: item.indicaciones ?? 'Medicamento genérico prescripto',
      cantAutorizada: item.cantidad,
      cantConsumida: item.cantConsumida ?? 0,
    })),
  };
}

export interface ConsumoResult {
  itemsConsumidos: Array<{ productoNombre: string; cantidad: number }>;
  totalMedicamentos: number;
}

export async function registrarConsumo(
  recetaId: string,
  items: { medicamento: string; cantConsumo: number }[],
): Promise<ConsumoResult> {
  const res = await api.post(`/recetas/${recetaId}/consumir`, { items });
  const data = res.data.data ?? {};
  return {
    itemsConsumidos: data.itemsConsumidos ?? [],
    totalMedicamentos: data.totalMedicamentos ?? 0,
  };
}
