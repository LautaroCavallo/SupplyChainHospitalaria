import { IRecepcionRepository } from '../../../domain/repositories/IRecepcionRepository';
import { RecepcionResponseDTO } from '../../dtos';
import { NotFoundError } from '../../errors/AppError';

export class ObtenerRecepcion {
  constructor(private readonly recepcionRepository: IRecepcionRepository) {}

  async execute(id: string): Promise<RecepcionResponseDTO> {
    const recepcion = await this.recepcionRepository.findById(id);
    if (!recepcion) {
      throw new NotFoundError(`Recepción con id ${id} no encontrada`);
    }
    return recepcion as unknown as RecepcionResponseDTO;
  }
}
