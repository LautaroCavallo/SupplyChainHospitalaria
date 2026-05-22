import { IRecepcionRepository } from '../../../domain/repositories/IRecepcionRepository';
import { RecepcionResponseDTO } from '../../dtos';
import { NotFoundError, ValidationError } from '../../errors/AppError';

export class ConfirmarRecepcion {
  constructor(private readonly recepcionRepository: IRecepcionRepository) {}

  async execute(id: string): Promise<RecepcionResponseDTO> {
    const recepcion = await this.recepcionRepository.findById(id);
    if (!recepcion) {
      throw new NotFoundError(`Recepción con id ${id} no encontrada`);
    }

    if (recepcion.estado !== 'BORRADOR') {
      throw new ValidationError(
        `La recepción debe estar en estado BORRADOR para confirmar. Estado actual: ${recepcion.estado}`,
      );
    }

    const result = await this.recepcionRepository.update(id, { estado: 'CONFIRMADA' });
    return result as unknown as RecepcionResponseDTO;
  }
}
