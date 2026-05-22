import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository';
import { AlertaStockDTO } from '../../dtos';

export class DetectarStockCritico {
  constructor(private readonly inventarioRepository: IInventarioRepository) {}

  async execute(): Promise<AlertaStockDTO[]> {
    const [sinStock, stockCritico, stockBajo] = await Promise.all([
      this.inventarioRepository.findSinStock(),
      this.inventarioRepository.findStockCritico(),
      this.inventarioRepository.findStockBajo(),
    ]);

    const alertas: AlertaStockDTO[] = [];
    const productosVistos = new Set<string>();

    for (const producto of sinStock) {
      productosVistos.add(producto.id);
      alertas.push({
        id: producto.id,
        productoId: producto.id,
        nombre: producto.nombre,
        stockActual: producto.stockActual,
        stockMinimo: producto.stockMinimo,
        stockCritico: producto.stockCritico,
        nivel: 'SIN_STOCK',
        categoria: producto.categoria,
      });
    }

    for (const producto of stockCritico) {
      if (productosVistos.has(producto.id)) continue;
      productosVistos.add(producto.id);
      alertas.push({
        id: producto.id,
        productoId: producto.id,
        nombre: producto.nombre,
        stockActual: producto.stockActual,
        stockMinimo: producto.stockMinimo,
        stockCritico: producto.stockCritico,
        nivel: 'CRITICO',
        categoria: producto.categoria,
      });
    }

    for (const producto of stockBajo) {
      if (productosVistos.has(producto.id)) continue;
      alertas.push({
        id: producto.id,
        productoId: producto.id,
        nombre: producto.nombre,
        stockActual: producto.stockActual,
        stockMinimo: producto.stockMinimo,
        stockCritico: producto.stockCritico,
        nivel: 'BAJO',
        categoria: producto.categoria,
      });
    }

    return alertas;
  }
}
