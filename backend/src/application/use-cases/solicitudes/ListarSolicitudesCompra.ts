import { ISolicitudCompraRepository } from '../../../domain/repositories/ISolicitudCompraRepository';
import { SolicitudCompraResponseDTO, ResultadoPaginadoDTO } from '../../dtos';

export class ListarSolicitudesCompra {
  constructor(private readonly solicitudRepository: ISolicitudCompraRepository) {}

  async execute(filtros: Record<string, unknown> = {}): Promise<ResultadoPaginadoDTO<SolicitudCompraResponseDTO>> {
    const page = (filtros.page as number) ?? 1;
    const limit = (filtros.limit as number) ?? 20;

    const [data, total] = await Promise.all([
      this.solicitudRepository.findAll(filtros as any),
      this.solicitudRepository.count(filtros as any),
    ]);

    return {
      data: data as unknown as SolicitudCompraResponseDTO[],
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }
}
