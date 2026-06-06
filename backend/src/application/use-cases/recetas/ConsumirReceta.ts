import { IRecetaService } from '../../../domain/services/IRecetaService';
import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository';
import { IMovimientoStockRepository } from '../../../domain/repositories/IMovimientoStockRepository';
import { ValidationError } from '../../errors/AppError';

interface ItemReceta {
  productoId?: string;
  medicamento?: string;
  cantidad?: number;
  cantConsumo?: number;
  loteId?: string;
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

    const yaConsumida = await this.movimientoRepository.existsByTipoAndReferencia(
      'CONSUMO_RECETA',
      recetaId,
    );

    if (yaConsumida) {
      throw new ValidationError('La receta ya fue dispensada.');
    }

    const errors: string[] = [];
    const consumoItems: Array<{ productoId: string; loteId?: string; cantidad: number }> = [];

    for (const [index, item] of items.entries()) {
      const cantidad = item.cantidad ?? item.cantConsumo ?? 0;
      if (cantidad <= 0) {
        continue;
      }

      const itemLabel = item.medicamento ?? item.productoId ?? `ítem ${index + 1}`;
      const producto = item.productoId
        ? await this.inventarioRepository.findById(item.productoId)
        : (await this.inventarioRepository.findByGenerico(item.medicamento ?? ''))
            .find((p) => p.stockActual >= cantidad);

      if (!producto) {
        errors.push(`No hay producto comercial disponible para ${itemLabel}`);
        continue;
      }

      if (producto.stockActual <= 0) {
        errors.push(`No hay stock disponible para ${producto.nombre} (pedido: ${cantidad})`);
        continue;
      }

      if (producto.stockActual < cantidad) {
        errors.push(
          `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stockActual}, solicitado: ${cantidad}. Puede dispensar ${producto.stockActual}.`,
        );
        continue;
      }

      consumoItems.push({
        productoId: producto.id,
        loteId: item.loteId,
        cantidad,
      });
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join('; '));
    }

    if (consumoItems.length === 0) {
      throw new ValidationError('No hay ítems válidos para consumir en la receta.');
    }

    const resultadoConsumo = await this.recetaService.consumirReceta(recetaId, consumoItems);

    if (!resultadoConsumo.exitoso || resultadoConsumo.errores.length > 0) {
      const mensaje = resultadoConsumo.errores.length > 0
        ? resultadoConsumo.errores.join('; ')
        : `No se pudo consumir la receta ${recetaId}`;
      throw new ValidationError(mensaje);
    }

    const registro = await this.movimientoRepository.registrarConsumoReceta({
      recetaId,
      items: consumoItems,
    });

    if (registro.duplicada) {
      throw new ValidationError('La receta ya fue dispensada.');
    }

    if (registro.errores.length > 0) {
      throw new ValidationError(registro.errores.join('; '));
    }
  }
}
