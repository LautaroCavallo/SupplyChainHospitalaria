import { IProveedorRepository } from '../../../domain/repositories/IProveedorRepository';
import { ProveedorResponseDTO } from '../../dtos';
import { NotFoundError } from '../../errors/AppError';

export class ObtenerProveedor {
  constructor(private readonly proveedorRepository: IProveedorRepository) {}

  async execute(id: string): Promise<ProveedorResponseDTO> {
    const proveedor = await this.proveedorRepository.findById(id);
    if (!proveedor) {
      throw new NotFoundError(`Proveedor con id ${id} no encontrado`);
    }
    return proveedor as unknown as ProveedorResponseDTO;
  }
}
