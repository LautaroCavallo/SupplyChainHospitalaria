import { IRecetaService, RecetaValidacion } from '../../../domain/services/IRecetaService';
import { IMovimientoStockRepository } from '../../../domain/repositories/IMovimientoStockRepository';

export class ValidarReceta {
  constructor(
    private readonly recetaService: IRecetaService,
    private readonly movimientoRepository: IMovimientoStockRepository,
  ) {}

  async execute(recetaId: string): Promise<RecetaValidacion> {
    const validacion = await this.recetaService.validarReceta(recetaId);
    const yaConsumida = await this.movimientoRepository.existsByTipoAndReferencia(
      'CONSUMO_RECETA',
      recetaId,
    );

    if (yaConsumida) {
      return {
        ...validacion,
        valida: false,
        consumida: true,
        estado: 'Consumida',
        errores: [...validacion.errores, 'La receta ya fue dispensada.'],
      };
    }

    return validacion;
  }
}
