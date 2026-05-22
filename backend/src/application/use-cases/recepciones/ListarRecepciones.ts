import { IRecepcionRepository } from '../../../domain/repositories/IRecepcionRepository';
import { FiltroRecepcionDTO, ResultadoPaginadoDTO, RecepcionResponseDTO } from '../../dtos';

export class ListarRecepciones {
  constructor(private readonly recepcionRepository: IRecepcionRepository) {}

  async execute(filtros: FiltroRecepcionDTO): Promise<ResultadoPaginadoDTO<RecepcionResponseDTO>> {
    const [data, total] = await Promise.all([
      this.recepcionRepository.findAll(filtros as any),
      this.recepcionRepository.count(filtros as any),
    ]);

    return {
      data: data as unknown as RecepcionResponseDTO[],
      total,
      page: filtros.page,
      limit: filtros.limit,
      totalPages: Math.ceil(total / filtros.limit),
    };
  }
}
