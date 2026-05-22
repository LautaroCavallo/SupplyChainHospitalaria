import { IProveedorRepository } from '../../../domain/repositories/IProveedorRepository';
import { NotFoundError } from '../../errors/AppError';

export class EliminarProveedor {
  constructor(private readonly proveedorRepository: IProveedorRepository) {}

  async execute(id: string): Promise<void> {
    const existente = await this.proveedorRepository.findById(id);
    if (!existente) {
      throw new NotFoundError(`Proveedor con id ${id} no encontrado`);
    }

    await this.proveedorRepository.update(id, { activo: false });
  }
}
