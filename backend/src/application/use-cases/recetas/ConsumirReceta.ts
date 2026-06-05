import { IRecetaService } from '../../../domain/services/IRecetaService';
import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository';
import { IMovimientoStockRepository } from '../../../domain/repositories/IMovimientoStockRepository';
import { ValidationError } from '../../errors/AppError';

interface ItemReceta {
  productoId?: string;
  medicamento?: string;
  cantidad?: number;
  cantConsumo?: number;
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
      const cantidad = item.cantidad ?? item.cantConsumo ?? 0;
      if (cantidad <= 0) {
        continue;
      }

      const producto = item.productoId
        ? await this.inventarioRepository.findById(item.productoId)
        : (await this.inventarioRepository.findByGenerico(item.medicamento ?? ''))
            .find((p) => p.stockActual >= cantidad);

      if (!producto) {
        throw new ValidationError(`No hay producto comercial disponible para ${item.medicamento ?? item.productoId}`);
      }

      if (producto.stockActual < cantidad) {
        throw new ValidationError(
          `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stockActual}, solicitado: ${cantidad}`,
        );
      }

      await this.inventarioRepository.updateStock(
        producto.id,
        producto.stockActual - cantidad,
      );

      await this.movimientoRepository.create({
        productoId: producto.id,
        tipo: 'CONSUMO_RECETA',
        cantidad,
        motivo: `Consumo por receta ${recetaId}${item.medicamento ? ` (${item.medicamento})` : ''}`,
        referencia: recetaId,
      });
    }

    await this.recetaService.consumirReceta(
      recetaId,
      items.map((item) => ({
        productoId: item.productoId ?? item.medicamento ?? '',
        cantidad: item.cantidad ?? item.cantConsumo ?? 0,
      })),
    );
  }
}
