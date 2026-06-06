import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository';
import { IMovimientoStockRepository } from '../../../domain/repositories/IMovimientoStockRepository';

export interface DashboardDTO {
  recetasValidadas: number;
  medicamentosCriticos: number;
  actividadReciente: number;
}

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export class ObtenerDashboard {
  constructor(
    private readonly inventarioRepository: IInventarioRepository,
    private readonly movimientoRepository: IMovimientoStockRepository,
  ) {}

  async execute(): Promise<DashboardDTO> {
    const fechaDesde = startOfToday();
    const [criticos, sinStock, movimientosHoy] = await Promise.all([
      this.inventarioRepository.findStockCritico(),
      this.inventarioRepository.findSinStock(),
      this.movimientoRepository.findAll({ fechaDesde, page: 1, limit: 1000 }),
    ]);

    const recetasValidadas = new Set(
      movimientosHoy
        .filter((movimiento) => movimiento.tipo === 'CONSUMO_RECETA')
        .map((movimiento) => movimiento.referencia ?? movimiento.id),
    ).size;

    return {
      recetasValidadas,
      medicamentosCriticos: criticos.length + sinStock.length,
      actividadReciente: movimientosHoy.length,
    };
  }
}
