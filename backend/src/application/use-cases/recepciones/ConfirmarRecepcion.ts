import { IRecepcionRepository } from '../../../domain/repositories/IRecepcionRepository';
import { RecepcionResponseDTO } from '../../dtos';
import { NotFoundError, ValidationError } from '../../errors/AppError';

export class ConfirmarRecepcion {
  constructor(private readonly recepcionRepository: IRecepcionRepository) {}

  async execute(id: string, usuarioId?: string): Promise<RecepcionResponseDTO> {
    const recepcion = await this.recepcionRepository.findById(id);
    if (!recepcion) {
      throw new NotFoundError(`Recepción con id ${id} no encontrada`);
    }

    if (recepcion.estado !== 'PROCESADA') {
      throw new ValidationError(
        `La recepción debe estar en estado PROCESADA para confirmar. Estado actual: ${recepcion.estado}`,
      );
    }

    const result = await this.recepcionRepository.procesarStock(id, usuarioId);
    return result as unknown as RecepcionResponseDTO;
  }
}
