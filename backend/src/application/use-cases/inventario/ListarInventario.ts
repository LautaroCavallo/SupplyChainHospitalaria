import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository';
import { FiltroInventarioDTO, ResultadoPaginadoDTO, ProductoInventarioResponseDTO } from '../../dtos';

function calcularEstado(stockActual: number, stockMinimo: number, stockCritico: number): string {
  if (stockActual === 0) return 'SIN_STOCK';
  if (stockActual <= stockCritico) return 'CRITICO';
  if (stockActual <= stockMinimo) return 'BAJO';
  return 'NORMAL';
}

export class ListarInventario {
  constructor(private readonly inventarioRepository: IInventarioRepository) {}

  async execute(filtros: FiltroInventarioDTO): Promise<ResultadoPaginadoDTO<ProductoInventarioResponseDTO>> {
    const [data, total] = await Promise.all([
      this.inventarioRepository.findAll(filtros as any),
      this.inventarioRepository.count(filtros as any),
    ]);

    const mapped = data.map((producto) => ({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? null,
      principioActivo: producto.principioActivo ?? null,
      presentacion: producto.presentacion ?? null,
      categoria: producto.categoria,
      ean: producto.ean ?? null,
      troquel: producto.troquel ?? null,
      stockActual: producto.stockActual,
      stockMinimo: producto.stockMinimo,
      stockCritico: producto.stockCritico,
      unidad: producto.unidad,
      proveedor: producto.proveedor ?? null,
      estado: calcularEstado(producto.stockActual, producto.stockMinimo, producto.stockCritico),
      activo: producto.activo,
    }));

    return {
      data: mapped,
      total,
      page: filtros.page,
      limit: filtros.limit,
      totalPages: Math.ceil(total / filtros.limit),
    };
  }
}
