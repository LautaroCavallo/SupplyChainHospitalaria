import { ISolicitudCompraRepository } from '../../../domain/repositories/ISolicitudCompraRepository';
import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository';
import { INotificacionRepository } from '../../../domain/repositories/INotificacionRepository';

/**
 * Genera automáticamente una solicitud de compra (en estado PENDIENTE) cuando un
 * producto alcanza nivel CRÍTICO o SIN STOCK, evitando duplicar si ya existe una
 * solicitud abierta para ese producto.
 *
 * Es best-effort: cualquier error se traga para no interrumpir la operación de
 * stock que lo disparó (ajuste o consumo de receta).
 */
export class GenerarSolicitudAutomatica {
  constructor(
    private readonly inventarioRepository: IInventarioRepository,
    private readonly solicitudRepository: ISolicitudCompraRepository,
    private readonly notificacionRepository?: INotificacionRepository,
  ) {}

  async execute(productoId: string): Promise<void> {
    try {
      const producto = await this.inventarioRepository.findById(productoId);
      if (!producto || !producto.activo) return;

      const nivel = producto.getNivelStock();
      if (nivel !== 'CRITICO' && nivel !== 'SIN_STOCK') return;

      // Evitar duplicados: no generar si ya hay una solicitud abierta para el producto
      const yaExiste = await this.solicitudRepository.existeSolicitudActivaParaProducto(productoId);
      if (yaExiste) return;

      // Cantidad sugerida: reponer hasta el stock mínimo (al menos 1)
      const cantidad = Math.max(1, producto.stockMinimo - producto.stockActual);

      await this.solicitudRepository.create({
        estado: 'PENDIENTE',
        prioridad: nivel === 'SIN_STOCK' ? 'URGENTE' : 'ALTA',
        motivo: 'Generación automática por stock crítico',
        proveedorSugeridoId: producto.proveedorId,
        detalles: [{ productoId, cantidadSolicitada: cantidad, unidad: producto.unidad }],
      });

      // Notificación best-effort
      if (this.notificacionRepository) {
        try {
          await this.notificacionRepository.create({
            tipo: 'stock_ajustado',
            titulo: `Orden automática generada: ${producto.nombre}`,
            descripcion: `Se generó una solicitud de compra automática por stock ${nivel === 'SIN_STOCK' ? 'agotado' : 'crítico'} (stock actual: ${producto.stockActual}, mínimo: ${producto.stockMinimo}).`,
            referencia: productoId,
          });
        } catch {
          // ignorar fallo de notificación
        }
      }
    } catch {
      // best-effort: no interrumpir la operación de stock que disparó esto
    }
  }
}
