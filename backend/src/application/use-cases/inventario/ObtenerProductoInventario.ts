import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository';
import { ProductoInventarioResponseDTO } from '../../dtos';
import { NotFoundError } from '../../errors/AppError';

export class ObtenerProductoInventario {
  constructor(private readonly inventarioRepository: IInventarioRepository) {}

  async execute(id: string): Promise<ProductoInventarioResponseDTO> {
    const producto = await this.inventarioRepository.findById(id);
    if (!producto) {
      throw new NotFoundError(`Producto con id ${id} no encontrado`);
    }
    return producto as unknown as ProductoInventarioResponseDTO;
  }
}
