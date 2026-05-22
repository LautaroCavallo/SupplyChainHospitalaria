import { MovimientoStock, TipoMovimiento } from '../entities/MovimientoStock';

export interface FiltrosMovimiento {
  tipo?: TipoMovimiento;
  fechaDesde?: Date;
  fechaHasta?: Date;
  usuarioId?: string;
  page?: number;
  limit?: number;
}

export interface CreateMovimientoData {
  productoId: string;
  loteId?: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo: string;
  referencia?: string;
  usuarioId?: string;
}

export interface IMovimientoStockRepository {
  findByProductoId(productoId: string, filtros?: FiltrosMovimiento): Promise<MovimientoStock[]>;
  create(data: CreateMovimientoData): Promise<MovimientoStock>;
  findAll(filtros?: FiltrosMovimiento): Promise<MovimientoStock[]>;
}
