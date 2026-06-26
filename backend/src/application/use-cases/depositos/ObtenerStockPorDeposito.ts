import { IDepositoRepository, StockPorDeposito } from '../../../domain/repositories/IDepositoRepository';

export class ObtenerStockPorDeposito {
  constructor(private readonly depositoRepository: IDepositoRepository) {}

  async execute(productoId: string): Promise<StockPorDeposito[]> {
    return this.depositoRepository.stockPorProducto(productoId);
  }
}
