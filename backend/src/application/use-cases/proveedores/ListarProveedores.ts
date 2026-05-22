import { IProveedorRepository } from '../../../domain/repositories/IProveedorRepository';
import { FiltroProveedorDTO, ResultadoPaginadoDTO, ProveedorResponseDTO } from '../../dtos';

export class ListarProveedores {
  constructor(private readonly proveedorRepository: IProveedorRepository) {}

  async execute(filtros: FiltroProveedorDTO): Promise<ResultadoPaginadoDTO<ProveedorResponseDTO>> {
    const [data, total] = await Promise.all([
      this.proveedorRepository.findAll(filtros),
      this.proveedorRepository.count(filtros),
    ]);

    return {
      data: data as unknown as ProveedorResponseDTO[],
      total,
      page: filtros.page,
      limit: filtros.limit,
      totalPages: Math.ceil(total / filtros.limit),
    };
  }
}
