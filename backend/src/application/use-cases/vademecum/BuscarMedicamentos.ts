import { IVademecumService } from '../../../domain/services/IVademecumService';
import { MedicamentoVademecumDTO } from '../../dtos';

export class BuscarMedicamentos {
  constructor(private readonly vademecumService: IVademecumService) {}

  async execute(query: string): Promise<MedicamentoVademecumDTO[]> {
    return this.vademecumService.buscarMedicamentos(query);
  }
}
