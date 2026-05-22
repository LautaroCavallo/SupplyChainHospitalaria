import { IRecetaService, RecetaValidacion } from '../../../domain/services/IRecetaService';

export class ValidarReceta {
  constructor(private readonly recetaService: IRecetaService) {}

  async execute(recetaId: string): Promise<RecetaValidacion> {
    return this.recetaService.validarReceta(recetaId);
  }
}
