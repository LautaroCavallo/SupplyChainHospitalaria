import { IRecepcionRepository } from '../../../domain/repositories/IRecepcionRepository';
import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository';
import { ILoteRepository } from '../../../domain/repositories/ILoteRepository';
import { IMovimientoStockRepository } from '../../../domain/repositories/IMovimientoStockRepository';
import { RecepcionResponseDTO } from '../../dtos';
import { NotFoundError, ValidationError } from '../../errors/AppError';

export class ProcesarRecepcion {
  constructor(
    private readonly recepcionRepository: IRecepcionRepository,
    private readonly inventarioRepository: IInventarioRepository,
    private readonly loteRepository: ILoteRepository,
    private readonly movimientoRepository: IMovimientoStockRepository,
  ) {}

  async execute(id: string): Promise<RecepcionResponseDTO> {
    const recepcion = await this.recepcionRepository.findById(id);
    if (!recepcion) {
      throw new NotFoundError(`Recepción con id ${id} no encontrada`);
    }

    if (recepcion.estado !== 'CONFIRMADA') {
      throw new ValidationError(
        `La recepción debe estar en estado CONFIRMADA para procesar. Estado actual: ${recepcion.estado}`,
      );
    }

    for (const detalle of recepcion.detalles) {
      const producto = await this.inventarioRepository.findById(detalle.productoId);
      if (!producto) {
        throw new NotFoundError(`Producto con id ${detalle.productoId} no encontrado`);
      }

      const lote = await this.loteRepository.create({
        productoId: detalle.productoId,
        numeroLote: detalle.lote,
        fechaVencimiento: detalle.fechaVencimiento,
        stockInicial: detalle.cantidad,
        stockDisponible: detalle.cantidad,
      });

      await this.inventarioRepository.updateStock(
        detalle.productoId,
        producto.stockActual + detalle.cantidad,
      );

      await this.movimientoRepository.create({
        productoId: detalle.productoId,
        loteId: lote.id,
        tipo: 'INGRESO',
        cantidad: detalle.cantidad,
        motivo: `Recepción ${recepcion.id} - Remito: ${recepcion.remito ?? 'S/N'}`,
        referencia: recepcion.id,
      });
    }

    const result = await this.recepcionRepository.update(id, { estado: 'PROCESADA' });
    return result as unknown as RecepcionResponseDTO;
  }
}
