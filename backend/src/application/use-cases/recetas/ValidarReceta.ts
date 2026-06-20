import { IRecetaService, RecetaValidacion } from '../../../domain/services/IRecetaService';
import { IMovimientoStockRepository } from '../../../domain/repositories/IMovimientoStockRepository';
import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository';

export class ValidarReceta {
  constructor(
    private readonly recetaService: IRecetaService,
    private readonly movimientoRepository: IMovimientoStockRepository,
    private readonly inventarioRepository: IInventarioRepository,
  ) {}

  async execute(recetaId: string): Promise<RecetaValidacion> {
    const validacion = await this.recetaService.validarReceta(recetaId);
    const yaConsumida = await this.movimientoRepository.existsByTipoAndReferencia(
      'CONSUMO_RECETA',
      recetaId,
    );

    if (!yaConsumida) {
      return validacion;
    }

    const movimientos = await this.movimientoRepository.findByTipoAndReferencia(
      'CONSUMO_RECETA',
      recetaId,
    );

    // Sumar cantidades consumidas por productoId
    const consumoPorProducto = new Map<string, number>();
    for (const mov of movimientos) {
      consumoPorProducto.set(mov.productoId, (consumoPorProducto.get(mov.productoId) ?? 0) + mov.cantidad);
    }

    // Mapear cantConsumida a cada ítem de la receta
    const itemsConConsumo = await Promise.all(
      validacion.items.map(async (item) => {
        let cantConsumida = 0;

        if (item.productoId) {
          cantConsumida = consumoPorProducto.get(item.productoId) ?? 0;
        } else if (item.medicamento || item.nombre) {
          // Resolver el medicamento genérico al producto real para buscar en los movimientos
          const productos = await this.inventarioRepository.findByGenerico(
            item.medicamento ?? item.nombre,
          );
          for (const prod of productos) {
            cantConsumida += consumoPorProducto.get(prod.id) ?? 0;
          }
        }

        return { ...item, cantConsumida };
      }),
    );

    return {
      ...validacion,
      valida: false,
      consumida: true,
      estado: 'Consumida',
      errores: [...validacion.errores, 'La receta ya fue dispensada.'],
      items: itemsConConsumo,
    };
  }
}
