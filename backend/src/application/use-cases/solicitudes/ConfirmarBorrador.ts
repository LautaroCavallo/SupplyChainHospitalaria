import { ISolicitudCompraRepository } from '../../../domain/repositories/ISolicitudCompraRepository';
import { SolicitudCompraResponseDTO } from '../../dtos';
import { NotFoundError, ValidationError } from '../../errors/AppError';

export class ConfirmarBorrador {
  constructor(private readonly solicitudRepository: ISolicitudCompraRepository) {}

  async execute(id: string): Promise<SolicitudCompraResponseDTO> {
    const solicitud = await this.solicitudRepository.findById(id);
    if (!solicitud) {
      throw new NotFoundError(`Solicitud ${id} no encontrada`);
    }

    if (solicitud.estado !== 'BORRADOR') {
      throw new ValidationError('Solo se puede confirmar una solicitud en estado BORRADOR');
    }

    const result = await this.solicitudRepository.update(id, { estado: 'PENDIENTE' });
    return result as unknown as SolicitudCompraResponseDTO;
  }
}
