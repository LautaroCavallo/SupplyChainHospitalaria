import { TipoMovimiento } from '../../../domain/entities/MovimientoStock';
import { IMovimientoStockRepository } from '../../../domain/repositories/IMovimientoStockRepository';
import { ResultadoPaginadoDTO } from '../../dtos';

type TipoEvento = 'receta_validada' | 'stock_ajustado' | 'nueva_recepcion' | 'validacion_rechazada' | 'otro';

export interface ActividadRecienteDTO {
  id: string;
  evento: string;
  tipoEvento: TipoEvento;
  referencia?: string;
  producto?: string;
  hora: string;
  responsable: string;
  createdAt: Date;
}

interface FiltrosActividad {
  page: number;
  limit: number;
  busqueda?: string;
  usuario?: string;
  evento?: string;
  desde?: Date;
  hasta?: Date;
}

const eventoToTipo: Record<string, TipoMovimiento | 'SALIDAS' | undefined> = {
  receta_validada: 'CONSUMO_RECETA',
  stock_ajustado: undefined,
  nueva_recepcion: 'INGRESO',
};

export class ObtenerActividadReciente {
  constructor(private readonly movimientoRepository: IMovimientoStockRepository) {}

  async execute(filtros: FiltrosActividad): Promise<ResultadoPaginadoDTO<ActividadRecienteDTO>> {
    const repoFiltros = {
      page: 1,
      limit: 1000,
      tipo: eventoToTipo[filtros.evento ?? ''],
      usuarioId: filtros.usuario,
      fechaDesde: filtros.desde,
      fechaHasta: filtros.hasta,
    };

    const movimientos = await this.movimientoRepository.findAll(repoFiltros);
    const busqueda = filtros.busqueda?.trim().toLowerCase();
    const actividad = movimientos
      .map((movimiento) => this.toActividad(movimiento))
      .filter((item) => {
        if (filtros.evento === 'stock_ajustado' && item.tipoEvento !== 'stock_ajustado') return false;
        if (filtros.evento && filtros.evento !== 'stock_ajustado' && item.tipoEvento !== filtros.evento) return false;
        if (!busqueda) return true;
        return [
          item.evento,
          item.referencia,
          item.producto,
          item.responsable,
        ].some((value) => value?.toLowerCase().includes(busqueda));
      });

    const start = (filtros.page - 1) * filtros.limit;
    const data = actividad.slice(start, start + filtros.limit);

    return {
      data,
      total: actividad.length,
      page: filtros.page,
      limit: filtros.limit,
      totalPages: Math.max(1, Math.ceil(actividad.length / filtros.limit)),
    };
  }

  private toActividad(movimiento: any): ActividadRecienteDTO {
    const tipoEvento = this.toTipoEvento(movimiento);
    return {
      id: movimiento.id,
      evento: this.toEventoLabel(movimiento, tipoEvento),
      tipoEvento,
      referencia: movimiento.referencia ?? movimiento.motivo,
      producto: movimiento.producto?.nombre ?? movimiento.motivo,
      hora: movimiento.createdAt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      responsable: movimiento.usuarioId ?? 'Sistema',
      createdAt: movimiento.createdAt,
    };
  }

  private toTipoEvento(movimiento: any): TipoEvento {
    if (movimiento.tipo === 'CONSUMO_RECETA') return 'receta_validada';
    if (movimiento.tipo === 'INGRESO' && movimiento.motivo?.startsWith('Recepción')) return 'nueva_recepcion';
    if (['AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO', 'EGRESO', 'INGRESO'].includes(movimiento.tipo)) return 'stock_ajustado';
    return 'otro';
  }

  private toEventoLabel(movimiento: any, tipoEvento: TipoEvento): string {
    if (tipoEvento === 'receta_validada') return 'Receta dispensada';
    if (tipoEvento === 'nueva_recepcion') return 'Nueva recepción';
    if (tipoEvento === 'stock_ajustado') {
      return movimiento.tipo === 'AJUSTE_NEGATIVO' || movimiento.tipo === 'EGRESO'
        ? 'Stock descontado'
        : 'Stock ajustado';
    }
    return 'Movimiento de stock';
  }
}
