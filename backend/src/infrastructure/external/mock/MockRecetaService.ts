import { IRecetaService, RecetaValidacion, ItemConsumo, ResultadoConsumo } from '../../../domain/services/IRecetaService';

export class MockRecetaService implements IRecetaService {
  async validarReceta(recetaId: string): Promise<RecetaValidacion> {
    return {
      recetaId,
      valida: true,
      pacienteId: 'pac-001',
      pacienteNombre: 'Juan Carlos Pérez',
      medicoId: 'med-001',
      medicoNombre: 'Dra. María García',
      items: [
        {
          productoId: 'prod-001',
          nombre: 'Amoxicilina 500mg',
          cantidad: 21,
          indicaciones: '1 cada 8hs por 7 días',
        },
        {
          productoId: 'prod-002',
          nombre: 'Ibuprofeno 400mg',
          cantidad: 10,
          indicaciones: '1 cada 8hs si hay dolor',
        },
      ],
      errores: [],
    };
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
