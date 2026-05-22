import { IVademecumService } from '../../../domain/services/IVademecumService';
import { MedicamentoVademecumDTO } from '../../dtos';

export class ObtenerMedicamento {
  constructor(private readonly vademecumService: IVademecumService) {}

  async execute(id: string): Promise<MedicamentoVademecumDTO | null> {
    return this.vademecumService.obtenerMedicamento(id);
  }
}
