import { Request, Response, NextFunction } from 'express';
import { INotificacionRepository } from '../../../domain/repositories/INotificacionRepository';
import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository';
import { ILoteRepository } from '../../../domain/repositories/ILoteRepository';

export class NotificacionController {
  constructor(
    private readonly notificacionRepository: INotificacionRepository,
    private readonly inventarioRepository: IInventarioRepository,
    private readonly loteRepository: ILoteRepository,
  ) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await Promise.all([
        this.generarNotificacionesStockCritico(),
        this.generarNotificacionesLotesPorVencer(),
      ]);

      const data = await this.notificacionRepository.findAll();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  marcarLeidas = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.notificacionRepository.marcarTodasLeidas();
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  private async generarNotificacionesStockCritico(): Promise<void> {
    try {
      const [sinStock, criticos] = await Promise.all([
        this.inventarioRepository.findSinStock(),
        this.inventarioRepository.findStockCritico(),
      ]);

      const productos = [...sinStock, ...criticos];
      const vistos = new Set<string>();

      for (const producto of productos) {
        if (vistos.has(producto.id)) continue;
        vistos.add(producto.id);

        const nivel = producto.stockActual <= 0 ? 'sin stock' : 'crítico';
        await this.notificacionRepository.crearSiNoExiste({
          tipo: 'stock_critico',
          titulo: `Stock ${nivel}: ${producto.nombre}`,
          descripcion: `El stock ha caído por debajo del mínimo (${producto.stockActual} uds disponibles, mínimo: ${producto.stockMinimo}).`,
          referencia: `stock_critico_${producto.id}`,
        });
      }
    } catch {
      // No interrumpir el flujo
    }
  }

  private async generarNotificacionesLotesPorVencer(): Promise<void> {
    try {
      const lotes = await this.loteRepository.findProximosAVencer(30);

      for (const lote of lotes) {
        const producto = await this.inventarioRepository.findById(lote.productoId);
        if (!producto) continue;

        const diasRestantes = Math.ceil(
          (lote.fechaVencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );

        await this.notificacionRepository.crearSiNoExiste({
          tipo: 'lote_por_vencer',
          titulo: `Lote próximo a vencer: ${producto.nombre}`,
          descripcion: `El lote ${lote.numeroLote} vence en ${diasRestantes} día(s). Stock disponible: ${lote.stockDisponible} uds.`,
          referencia: `lote_vencer_${lote.id}`,
        });
      }
    } catch {
      // No interrumpir el flujo
    }
  }
}
