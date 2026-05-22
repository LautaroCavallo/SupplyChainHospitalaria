import { IProveedorRepository } from '../../../domain/repositories/IProveedorRepository';
import { ActualizarProveedorDTO, ProveedorResponseDTO } from '../../dtos';
import { NotFoundError } from '../../errors/AppError';

export class ActualizarProveedor {
  constructor(private readonly proveedorRepository: IProveedorRepository) {}

  async execute(id: string, dto: ActualizarProveedorDTO): Promise<ProveedorResponseDTO> {
    const existente = await this.proveedorRepository.findById(id);
    if (!existente) {
      throw new NotFoundError(`Proveedor con id ${id} no encontrado`);
    }

    const result = await this.proveedorRepository.update(id, dto);
    return result as unknown as ProveedorResponseDTO;
  }
}
