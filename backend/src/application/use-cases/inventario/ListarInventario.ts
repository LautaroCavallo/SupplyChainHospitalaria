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
    const { estado, page, limit, ...repoFiltros } = filtros;
    const productos = await this.inventarioRepository.findAll({
      ...repoFiltros,
      nivelStock: estado as any,
      page: 1,
      limit: 10000,
    } as any);

    const mapped = productos.map((producto) => ({
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
      genericoId: producto.genericoId ?? null,
      generico: producto.generico
        ? {
            id: producto.generico.id,
            nombre: producto.generico.nombre,
            principioActivo: producto.generico.principioActivo,
            dosis: producto.generico.dosis ?? null,
            formaFarmaceutica: producto.generico.formaFarmaceutica ?? null,
          }
        : null,
      estado: calcularEstado(producto.stockActual, producto.stockMinimo, producto.stockCritico),
      activo: producto.activo,
    }));
    const start = (page - 1) * limit;
    const data = mapped.slice(start, start + limit);

    return {
      data,
      total: mapped.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(mapped.length / limit)),
    };
  }
}
