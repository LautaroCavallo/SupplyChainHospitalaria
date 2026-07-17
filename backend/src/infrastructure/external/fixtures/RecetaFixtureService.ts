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
      alertas: [],
      alergias: [],
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
      alertas: [],
      alergias: [],
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
      alertas: [],
      alergias: [],
      consumida: false,
      estado: 'Activa',
    },
    '8505': {
      recetaId: '8505',
      valida: true,
      pacienteId: '10503',
      pacienteNombre: 'Martín Suárez',
      medicoId: '305',
      medicoNombre: 'Dra. Ana Torres',
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
      alertas: [],
      alergias: [],
      consumida: false,
      estado: 'Activa',
    },
    '8506': {
      recetaId: '8506',
      valida: true,
      pacienteId: '10504',
      pacienteNombre: 'Paciente de Prueba',
      medicoId: '306',
      medicoNombre: 'Dra. Laura Sánchez',
      items: [
        {
          productoId: '',
          nombre: 'Amoxicilina 500mg',
          medicamento: 'Amoxicilina 500mg',
          cantidad: 9,
          indicaciones: 'Tomar según indicación médica.',
        },
      ],
      errores: [],
      alertas: [],
      alergias: [],
      consumida: false,
      estado: 'Activa',
    },
    '8507': {
      recetaId: '8507',
      valida: true,
      pacienteId: '10505',
      pacienteNombre: 'Sofía Ramírez',
      medicoId: '307',
      medicoNombre: 'Dr. Gabriel Ortiz',
      items: [
        { productoId: '', nombre: 'Amoxicilina 500mg', medicamento: 'Amoxicilina 500mg', cantidad: 2, indicaciones: 'Tomar 1 comprimido cada 8 horas por 7 días.' },
        { productoId: '', nombre: 'Paracetamol 500mg', medicamento: 'Paracetamol 500mg', cantidad: 3, indicaciones: 'Tomar 1 comprimido cada 6 horas si hay fiebre.' },
      ],
      errores: [],
      alertas: [],
      alergias: [],
      consumida: false,
      estado: 'Activa',
    },
    '8508': {
      recetaId: '8508',
      valida: true,
      pacienteId: '10506',
      pacienteNombre: 'Diego Morales',
      medicoId: '308',
      medicoNombre: 'Dra. Valeria Núñez',
      items: [
        { productoId: '', nombre: 'Ibuprofeno 400mg', medicamento: 'Ibuprofeno 400mg', cantidad: 4, indicaciones: 'Tomar 1 comprimido cada 8 horas con las comidas.' },
      ],
      errores: [],
      alertas: [],
      alergias: [],
      consumida: false,
      estado: 'Activa',
    },
    '8509': {
      recetaId: '8509',
      valida: true,
      pacienteId: '10507',
      pacienteNombre: 'Carla Giménez',
      medicoId: '309',
      medicoNombre: 'Dr. Hernán Díaz',
      items: [
        { productoId: '', nombre: 'Omeprazol 20mg', medicamento: 'Omeprazol 20mg', cantidad: 2, indicaciones: 'Tomar 1 cápsula en ayunas.' },
        { productoId: '', nombre: 'Dexametasona 4mg', medicamento: 'Dexametasona 4mg', cantidad: 1, indicaciones: 'Tomar 1 comprimido por la mañana.' },
      ],
      errores: [],
      alertas: [],
      alergias: [],
      consumida: false,
      estado: 'Activa',
    },
    '8510': {
      recetaId: '8510',
      valida: true,
      pacienteId: '10508',
      pacienteNombre: 'Roberto Vega',
      medicoId: '310',
      medicoNombre: 'Dra. Florencia Ruiz',
      items: [
        { productoId: '', nombre: 'Diclofenac 75mg', medicamento: 'Diclofenac 75mg', cantidad: 2, indicaciones: 'Tomar 1 comprimido cada 12 horas.' },
      ],
      errores: [],
      alertas: [],
      alergias: [],
      consumida: false,
      estado: 'Activa',
    },
    '8511': {
      recetaId: '8511',
      valida: true,
      pacienteId: '10509',
      pacienteNombre: 'Elena Castro',
      medicoId: '311',
      medicoNombre: 'Dr. Marcos Peña',
      items: [
        { productoId: '', nombre: 'Amoxicilina 500mg', medicamento: 'Amoxicilina 500mg', cantidad: 1, indicaciones: 'Tomar 1 comprimido cada 8 horas.' },
        { productoId: '', nombre: 'Ibuprofeno 400mg', medicamento: 'Ibuprofeno 400mg', cantidad: 2, indicaciones: 'Tomar si hay dolor.' },
        { productoId: '', nombre: 'Paracetamol 500mg', medicamento: 'Paracetamol 500mg', cantidad: 2, indicaciones: 'Alternar con ibuprofeno.' },
      ],
      errores: [],
      alertas: [],
      alergias: [],
      consumida: false,
      estado: 'Activa',
    },
    '8512': {
      recetaId: '8512',
      valida: true,
      pacienteId: '10510',
      pacienteNombre: 'Nicolás Ferreyra',
      medicoId: '312',
      medicoNombre: 'Dra. Camila Sosa',
      items: [
        { productoId: '', nombre: 'Warfarina 5mg', medicamento: 'Warfarina 5mg', cantidad: 2, indicaciones: 'Tomar 1 comprimido por día.' },
      ],
      errores: [],
      alertas: ['Interacción con anticoagulantes: riesgo de sangrado elevado'],
      alergias: [],
      consumida: false,
      estado: 'Activa',
    },
    '8513': {
      recetaId: '8513',
      valida: true,
      pacienteId: '10511',
      pacienteNombre: 'Julieta Aranda',
      medicoId: '313',
      medicoNombre: 'Dr. Ezequiel Molina',
      items: [
        { productoId: '', nombre: 'Amoxicilina 500mg', medicamento: 'Amoxicilina 500mg', cantidad: 2, indicaciones: 'Tomar 1 comprimido cada 8 horas por 7 días.' },
      ],
      errores: [],
      alertas: ['El paciente tiene alergia a Penicilina'],
      alergias: ['Penicilina'],
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
