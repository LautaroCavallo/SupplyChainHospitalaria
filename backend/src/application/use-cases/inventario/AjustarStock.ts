import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository';
import { IMovimientoStockRepository } from '../../../domain/repositories/IMovimientoStockRepository';
import { ILoteRepository } from '../../../domain/repositories/ILoteRepository';
import { AjusteStockDTO } from '../../dtos';
import { NotFoundError, ValidationError } from '../../errors/AppError';

export class AjustarStock {
  constructor(
    private readonly inventarioRepository: IInventarioRepository,
    private readonly movimientoRepository: IMovimientoStockRepository,
    private readonly loteRepository: ILoteRepository,
  ) {}

  async execute(productoId: string, dto: AjusteStockDTO): Promise<void> {
    const producto = await this.inventarioRepository.findById(productoId);
    if (!producto) {
      throw new NotFoundError(`Producto con id ${productoId} no encontrado`);
    }

    if (dto.cantidad <= 0) {
      throw new ValidationError('La cantidad debe ser mayor a 0');
    }

    const nuevoStock = dto.tipo === 'INCREMENTO'
      ? producto.stockActual + dto.cantidad
      : producto.stockActual - dto.cantidad;

    if (nuevoStock < 0) {
      throw new ValidationError(
        `Stock insuficiente. Stock actual: ${producto.stockActual}, decremento solicitado: ${dto.cantidad}`,
      );
    }

    await this.inventarioRepository.updateStock(productoId, nuevoStock);

    if (dto.loteId) {
      const lote = await this.loteRepository.findById(dto.loteId);
      if (!lote) {
        throw new NotFoundError(`Lote con id ${dto.loteId} no encontrado`);
      }

      const nuevoStockLote = dto.tipo === 'INCREMENTO'
        ? lote.stockDisponible + dto.cantidad
        : lote.stockDisponible - dto.cantidad;

      if (nuevoStockLote < 0) {
        throw new ValidationError(
          `Stock insuficiente en lote. Disponible: ${lote.stockDisponible}, decremento: ${dto.cantidad}`,
        );
      }

      await this.loteRepository.updateStock(dto.loteId, nuevoStockLote);
    }

    const tipoMovimiento = dto.tipo === 'INCREMENTO' ? 'AJUSTE_POSITIVO' as const : 'AJUSTE_NEGATIVO' as const;
    await this.movimientoRepository.create({
      productoId,
      loteId: dto.loteId,
      tipo: tipoMovimiento,
      cantidad: dto.cantidad,
      motivo: dto.motivo,
    });
  }
}
