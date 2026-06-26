import { ILoteRepository } from '../../../domain/repositories/ILoteRepository';
import { LoteResponseDTO } from '../../dtos';

export class ObtenerLotes {
  constructor(private readonly loteRepository: ILoteRepository) {}

  async execute(productoId: string): Promise<LoteResponseDTO[]> {
    const lotes = await this.loteRepository.findByProductoId(productoId);
    return lotes.map((lote) => ({
      id: lote.id,
      numeroLote: lote.numeroLote,
      productoId: lote.productoId,
      depositoId: lote.depositoId,
      depositoNombre: (lote as any).depositoNombre ?? '',
      fechaVencimiento: lote.fechaVencimiento,
      stockDisponible: lote.stockDisponible,
      stockInicial: lote.stockInicial,
      estado: lote.calcularEstado(),
    }));
  }
}
