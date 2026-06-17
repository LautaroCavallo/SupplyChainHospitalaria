import { ISolicitudCompraRepository } from '../../../domain/repositories/ISolicitudCompraRepository';
import { NotFoundError, ValidationError } from '../../errors/AppError';

export class EliminarSolicitudCompra {
  constructor(private readonly solicitudRepository: ISolicitudCompraRepository) {}

  async execute(id: string): Promise<void> {
    const solicitud = await this.solicitudRepository.findById(id);
    if (!solicitud) {
      throw new NotFoundError(`Solicitud ${id} no encontrada`);
    }

    if (solicitud.estado !== 'BORRADOR') {
      throw new ValidationError('Solo se puede eliminar una solicitud en estado BORRADOR');
    }

    await this.solicitudRepository.delete(id);
  }
}
