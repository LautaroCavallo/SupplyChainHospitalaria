import { IRecetaService } from '../../../domain/services/IRecetaService';
import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository';
import { IMovimientoStockRepository } from '../../../domain/repositories/IMovimientoStockRepository';
import { ValidationError } from '../../errors/AppError';

interface ItemReceta {
  productoId: string;
  cantidad: number;
}

export class ConsumirReceta {
  constructor(
    private readonly recetaService: IRecetaService,
    private readonly inventarioRepository: IInventarioRepository,
    private readonly movimientoRepository: IMovimientoStockRepository,
  ) {}

  async execute(recetaId: string, items: ItemReceta[]): Promise<void> {
    const validacion = await this.recetaService.validarReceta(recetaId);
    if (!validacion.valida) {
      throw new ValidationError(`La receta ${recetaId} no es válida`);
    }

    for (const item of items) {
      const producto = await this.inventarioRepository.findById(item.productoId);
      if (!producto) {
        throw new ValidationError(`Producto con id ${item.productoId} no encontrado`);
      }

      if (producto.stockActual < item.cantidad) {
        throw new ValidationError(
          `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stockActual}, solicitado: ${item.cantidad}`,
        );
      }

      await this.inventarioRepository.updateStock(
        item.productoId,
        producto.stockActual - item.cantidad,
      );

      await this.movimientoRepository.create({
        productoId: item.productoId,
        tipo: 'CONSUMO_RECETA',
        cantidad: item.cantidad,
        motivo: `Consumo por receta ${recetaId}`,
        referencia: recetaId,
      });
    }

    await this.recetaService.consumirReceta(recetaId, items);
  }
}
