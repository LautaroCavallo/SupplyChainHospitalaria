import { IMovimientoStockRepository } from '../../../domain/repositories/IMovimientoStockRepository';
import { ResultadoPaginadoDTO } from '../../dtos';

interface FiltrosHistorialLote {
  page: number;
  limit: number;
  tipo?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

interface MovimientoLoteDTO {
  id: string;
  loteId?: string | null;
  productoId: string;
  tipo: string;
  cantidad: number;
  origen?: string;
  destino?: string;
  motivo?: string;
  responsable?: string;
  createdAt: Date;
}

export class ObtenerHistorialLote {
  constructor(private readonly movimientoRepository: IMovimientoStockRepository) {}

  async execute(loteId: string, filtros: FiltrosHistorialLote): Promise<ResultadoPaginadoDTO<MovimientoLoteDTO>> {
    const repoFiltros = {
      page: filtros.page,
      limit: filtros.limit,
      tipo: filtros.tipo as any,
      fechaDesde: filtros.fechaDesde,
      fechaHasta: filtros.fechaHasta,
    };

    const [movimientos, total] = await Promise.all([
      this.movimientoRepository.findByLoteId(loteId, repoFiltros),
      this.movimientoRepository.countByLoteId(loteId, repoFiltros),
    ]);

    return {
      data: movimientos.map((movimiento) => ({
        id: movimiento.id,
        loteId: movimiento.loteId ?? null,
        productoId: movimiento.productoId,
        tipo: movimiento.tipo,
        cantidad: movimiento.cantidad,
        motivo: movimiento.motivo,
        responsable: movimiento.usuarioId,
        createdAt: movimiento.createdAt,
      })),
      total,
      page: filtros.page,
      limit: filtros.limit,
      totalPages: Math.max(1, Math.ceil(total / filtros.limit)),
    };
  }
}
