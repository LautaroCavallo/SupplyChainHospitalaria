import { IRecetaService, RecetaValidacion, ItemConsumo, ResultadoConsumo } from '../../../domain/services/IRecetaService';
import { NotFoundError } from '../../../application/errors/AppError';

export class RecetaFixtureService implements IRecetaService {
  private readonly recetas: Record<string, RecetaValidacion> = {
    '8502': {
      recetaId: '8502',
      valida: true,
      pacienteId: '10500',
      pacienteNombre: 'Juan Carlos Pérez',
      medicoId: '302',
      medicoNombre: 'Dra. María García',
      items: [
        {
          productoId: '',
          nombre: 'Amoxicilina 500mg',
          medicamento: 'Amoxicilina 500mg',
          cantidad: 2,
          indicaciones: 'Tomar 1 comprimido cada 8 horas por 7 días.',
        },
        {
          productoId: '',
          nombre: 'Ibuprofeno 400mg',
          medicamento: 'Ibuprofeno 400mg',
          cantidad: 1,
          indicaciones: 'Tomar 1 comprimido cada 8 horas si hay dolor.',
        },
      ],
      errores: [],
      consumida: false,
      estado: 'Activa',
    },
    '8503': {
      recetaId: '8503',
      valida: false,
      pacienteId: '10501',
      pacienteNombre: 'María López',
      medicoId: '303',
      medicoNombre: 'Dr. Pablo Rivas',
      items: [
        {
          productoId: '',
          nombre: 'Paracetamol 500mg',
          medicamento: 'Paracetamol 500mg',
          cantidad: 1,
          indicaciones: 'Tomar 1 comprimido cada 8 horas.',
        },
      ],
      errores: ['La receta está vencida'],
      consumida: false,
      estado: 'Vencida',
    },
    '8504': {
      recetaId: '8504',
      valida: true,
      pacienteId: '10502',
      pacienteNombre: 'Lucía Fernández',
      medicoId: '304',
      medicoNombre: 'Dr. Andrés Martín',
      items: [
        {
          productoId: '',
          nombre: 'Amoxicilina 500mg',
          medicamento: 'Amoxicilina 500mg',
          cantidad: 2,
          indicaciones: 'Tomar 1 comprimido cada 8 horas por 7 días.',
        },
      ],
      errores: [],
      consumida: false,
      estado: 'Activa',
    },
  };

  async validarReceta(recetaId: string): Promise<RecetaValidacion> {
    const receta = this.recetas[recetaId.trim()];
    if (!receta) {
      throw new NotFoundError(`Receta de prueba ${recetaId} no encontrada`);
    }

    return receta;
  }

  async consumirReceta(recetaId: string, items: ItemConsumo[]): Promise<ResultadoConsumo> {
    return {
      exitoso: true,
      recetaId,
      itemsConsumidos: items.map((item) => ({
        productoId: item.productoId,
        cantidadConsumida: item.cantidad,
        loteId: item.loteId,
        exitoso: true,
      })),
      errores: [],
    };
  }
}
