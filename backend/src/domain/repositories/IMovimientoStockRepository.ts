import { MovimientoStock, TipoMovimiento } from '../entities/MovimientoStock';

export interface FiltrosMovimiento {
  tipo?: TipoMovimiento | 'SALIDAS';
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

export interface ConsumoRecetaData {
  recetaId: string;
  usuarioId?: string;
  items: Array<{
    productoId: string;
    loteId?: string;
    cantidad: number;
  }>;
}

export interface ConsumoRecetaResult {
  duplicada: boolean;
  errores: string[];
}

export interface IMovimientoStockRepository {
  findByProductoId(productoId: string, filtros?: FiltrosMovimiento): Promise<MovimientoStock[]>;
  findByLoteId(loteId: string, filtros?: FiltrosMovimiento): Promise<MovimientoStock[]>;
  countByLoteId(loteId: string, filtros?: FiltrosMovimiento): Promise<number>;
  create(data: CreateMovimientoData): Promise<MovimientoStock>;
  findAll(filtros?: FiltrosMovimiento): Promise<MovimientoStock[]>;
  existsByTipoAndReferencia(tipo: TipoMovimiento, referencia: string): Promise<boolean>;
  registrarConsumoReceta(data: ConsumoRecetaData): Promise<ConsumoRecetaResult>;
}
