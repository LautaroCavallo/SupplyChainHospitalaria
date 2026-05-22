import { IProveedorRepository } from '../../../domain/repositories/IProveedorRepository';
import { CrearProveedorDTO, ProveedorResponseDTO } from '../../dtos';
import { ConflictError } from '../../errors/AppError';

export class CrearProveedor {
  constructor(private readonly proveedorRepository: IProveedorRepository) {}

  async execute(dto: CrearProveedorDTO): Promise<ProveedorResponseDTO> {
    const existente = await this.proveedorRepository.findByCuit(dto.cuit);
    if (existente) {
      throw new ConflictError(`Ya existe un proveedor con CUIT ${dto.cuit}`);
    }

    const result = await this.proveedorRepository.create(dto);
    return result as unknown as ProveedorResponseDTO;
  }
}
