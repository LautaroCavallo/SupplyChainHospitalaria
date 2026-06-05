import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository';
import { ProductoInventarioResponseDTO } from '../../dtos';
import { NotFoundError } from '../../errors/AppError';

export class ObtenerProductoPorEan {
  constructor(private readonly inventarioRepository: IInventarioRepository) {}

  async execute(ean: string): Promise<ProductoInventarioResponseDTO> {
    const producto = await this.inventarioRepository.findByEan(ean);
    if (!producto) {
      throw new NotFoundError(`Producto con EAN ${ean} no encontrado`);
    }

    return producto as unknown as ProductoInventarioResponseDTO;
  }
}
