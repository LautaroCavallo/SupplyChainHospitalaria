import { ILoteRepository } from '../../../domain/repositories/ILoteRepository';
import { LoteResponseDTO } from '../../dtos';

export class ObtenerLotes {
  constructor(private readonly loteRepository: ILoteRepository) {}

  async execute(productoId: string): Promise<LoteResponseDTO[]> {
    return this.loteRepository.findByProductoId(productoId);
  }
}
