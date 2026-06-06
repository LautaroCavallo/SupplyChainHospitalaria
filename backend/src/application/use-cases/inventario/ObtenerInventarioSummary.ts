import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository';

export interface InventarioSummaryDTO {
  totalProductos: number;
  alertaBajoStock: number;
  sinStock: number;
}

export class ObtenerInventarioSummary {
  constructor(private readonly inventarioRepository: IInventarioRepository) {}

  async execute(): Promise<InventarioSummaryDTO> {
    const [totalProductos, stockBajo, stockCritico, sinStock] = await Promise.all([
      this.inventarioRepository.count({ activo: true }),
      this.inventarioRepository.findStockBajo(),
      this.inventarioRepository.findStockCritico(),
      this.inventarioRepository.findSinStock(),
    ]);

    return {
      totalProductos,
      alertaBajoStock: stockBajo.length + stockCritico.length,
      sinStock: sinStock.length,
    };
  }
}
