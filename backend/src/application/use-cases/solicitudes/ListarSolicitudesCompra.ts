import { ISolicitudCompraRepository } from '../../../domain/repositories/ISolicitudCompraRepository';
import { SolicitudCompraResponseDTO } from '../../dtos';

export class ListarSolicitudesCompra {
  constructor(private readonly solicitudRepository: ISolicitudCompraRepository) {}

  async execute(filtros?: Record<string, unknown>): Promise<SolicitudCompraResponseDTO[]> {
    const result = await this.solicitudRepository.findAll(filtros as any);
    return result as unknown as SolicitudCompraResponseDTO[];
  }
}
