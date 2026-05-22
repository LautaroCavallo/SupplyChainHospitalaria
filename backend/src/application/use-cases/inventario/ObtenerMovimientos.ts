import { IMovimientoStockRepository } from '../../../domain/repositories/IMovimientoStockRepository';
import { MovimientoResponseDTO } from '../../dtos';

export class ObtenerMovimientos {
  constructor(private readonly movimientoRepository: IMovimientoStockRepository) {}

  async execute(productoId: string): Promise<MovimientoResponseDTO[]> {
    const movimientos = await this.movimientoRepository.findByProductoId(productoId);
    return movimientos as unknown as MovimientoResponseDTO[];
  }
}
