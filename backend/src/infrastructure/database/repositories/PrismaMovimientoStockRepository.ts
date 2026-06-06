import prisma from '../prisma-client';
import {
  IMovimientoStockRepository,
  FiltrosMovimiento,
  CreateMovimientoData,
  ConsumoRecetaData,
  ConsumoRecetaResult,
} from '../../../domain/repositories/IMovimientoStockRepository';
import { MovimientoStock, TipoMovimiento } from '../../../domain/entities/MovimientoStock';

export class PrismaMovimientoStockRepository implements IMovimientoStockRepository {
  private toEntity(raw: any): MovimientoStock {
    return new MovimientoStock(raw);
  }

  async findByProductoId(productoId: string, filtros: FiltrosMovimiento = {}): Promise<MovimientoStock[]> {
    const { tipo, fechaDesde, fechaHasta, page = 1, limit = 20 } = filtros;
    const where: any = { productoId };

    if (tipo === 'SALIDAS') where.tipo = { in: ['EGRESO', 'CONSUMO_RECETA'] };
    else if (tipo) where.tipo = tipo;
    if (fechaDesde || fechaHasta) {
      where.createdAt = {};
      if (fechaDesde) where.createdAt.gte = fechaDesde;
      if (fechaHasta) where.createdAt.lte = fechaHasta;
    }

    const data = await prisma.movimientoStock.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: { lote: true, producto: true },
      orderBy: { createdAt: 'desc' },
    });

    return data.map(this.toEntity);
  }

  async findByLoteId(loteId: string, filtros: FiltrosMovimiento = {}): Promise<MovimientoStock[]> {
    const { tipo, fechaDesde, fechaHasta, page = 1, limit = 20 } = filtros;
    const where: any = { loteId };

    if (tipo === 'SALIDAS') where.tipo = { in: ['EGRESO', 'CONSUMO_RECETA'] };
    else if (tipo) where.tipo = tipo;
    if (fechaDesde || fechaHasta) {
      where.createdAt = {};
      if (fechaDesde) where.createdAt.gte = fechaDesde;
      if (fechaHasta) where.createdAt.lte = fechaHasta;
    }

    const data = await prisma.movimientoStock.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: { lote: true, producto: true },
      orderBy: { createdAt: 'desc' },
    });

    return data.map(this.toEntity);
  }

  async countByLoteId(loteId: string, filtros: FiltrosMovimiento = {}): Promise<number> {
    const { tipo, fechaDesde, fechaHasta } = filtros;
    const where: any = { loteId };

    if (tipo === 'SALIDAS') where.tipo = { in: ['EGRESO', 'CONSUMO_RECETA'] };
    else if (tipo) where.tipo = tipo;
    if (fechaDesde || fechaHasta) {
      where.createdAt = {};
      if (fechaDesde) where.createdAt.gte = fechaDesde;
      if (fechaHasta) where.createdAt.lte = fechaHasta;
    }

    return prisma.movimientoStock.count({ where });
  }

  async existsByTipoAndReferencia(tipo: TipoMovimiento, referencia: string): Promise<boolean> {
    const count = await prisma.movimientoStock.count({
      where: {
        tipo,
        referencia,
      },
    });

    return count > 0;
  }

  async create(data: CreateMovimientoData): Promise<MovimientoStock> {
    const created = await prisma.movimientoStock.create({
      data: {
        productoId: data.productoId,
        loteId: data.loteId ?? null,
        tipo: data.tipo,
        cantidad: data.cantidad,
        motivo: data.motivo,
        referencia: data.referencia ?? null,
        usuarioId: data.usuarioId ?? null,
      },
      include: { lote: true, producto: true },
    });
    return this.toEntity(created);
  }

  async registrarConsumoReceta(data: ConsumoRecetaData): Promise<ConsumoRecetaResult> {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.movimientoStock.count({
        where: {
          tipo: 'CONSUMO_RECETA',
          referencia: data.recetaId,
        },
      });

      if (existing > 0) {
        return { duplicada: true, errores: [] };
      }

      const errores: string[] = [];
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      for (const item of data.items) {
        const producto = await tx.productoInventario.findUnique({
          where: { id: item.productoId },
        });

        if (!producto) {
          errores.push(`Producto no encontrado en inventario para ${item.productoId}`);
          continue;
        }

        if (producto.stockActual <= 0) {
          errores.push(`No hay stock disponible para ${producto.nombre} (pedido: ${item.cantidad})`);
          continue;
        }

        if (producto.stockActual < item.cantidad) {
          errores.push(
            `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stockActual}, solicitado: ${item.cantidad}. Puede dispensar ${producto.stockActual}.`,
          );
          continue;
        }

        const lotesDisponibles = await tx.lote.findMany({
          where: {
            productoId: item.productoId,
            stockDisponible: { gt: 0 },
            fechaVencimiento: { gte: today },
          },
          orderBy: [
            { fechaVencimiento: 'asc' },
            { createdAt: 'asc' },
          ],
        });

        const disponibleEnLotes = lotesDisponibles.reduce((total, lote) => total + lote.stockDisponible, 0);
        if (disponibleEnLotes < item.cantidad) {
          errores.push(
            `Stock insuficiente en lotes vigentes para ${producto.nombre}. Disponible en lotes: ${disponibleEnLotes}, solicitado: ${item.cantidad}.`,
          );
        }
      }

      if (errores.length > 0) {
        return { duplicada: false, errores };
      }

      for (const item of data.items) {
        const lotesDisponibles = await tx.lote.findMany({
          where: {
            productoId: item.productoId,
            stockDisponible: { gt: 0 },
            fechaVencimiento: { gte: today },
          },
          orderBy: [
            { fechaVencimiento: 'asc' },
            { createdAt: 'asc' },
          ],
        });
        let restante = item.cantidad;

        for (const lote of lotesDisponibles) {
          if (restante <= 0) break;

          const cantidadDelLote = Math.min(restante, lote.stockDisponible);
          await tx.lote.update({
            where: { id: lote.id },
            data: { stockDisponible: { decrement: cantidadDelLote } },
          });

          await tx.movimientoStock.create({
            data: {
              productoId: item.productoId,
              loteId: lote.id,
              tipo: 'CONSUMO_RECETA',
              cantidad: cantidadDelLote,
              motivo: `Consumo por receta ${data.recetaId} - Lote ${lote.numeroLote}`,
              referencia: data.recetaId,
              usuarioId: data.usuarioId ?? null,
            },
          });

          restante -= cantidadDelLote;
        }

        await tx.productoInventario.update({
          where: { id: item.productoId },
          data: { stockActual: { decrement: item.cantidad } },
        });
      }

      return { duplicada: false, errores: [] };
    });
  }

  async findAll(filtros: FiltrosMovimiento = {}): Promise<MovimientoStock[]> {
    const { tipo, fechaDesde, fechaHasta, usuarioId, page = 1, limit = 20 } = filtros;
    const where: any = {};

    if (tipo === 'SALIDAS') where.tipo = { in: ['EGRESO', 'CONSUMO_RECETA'] };
    else if (tipo) where.tipo = tipo;
    if (usuarioId) where.usuarioId = usuarioId;
    if (fechaDesde || fechaHasta) {
      where.createdAt = {};
      if (fechaDesde) where.createdAt.gte = fechaDesde;
      if (fechaHasta) where.createdAt.lte = fechaHasta;
    }

    const data = await prisma.movimientoStock.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: { lote: true, producto: true },
      orderBy: { createdAt: 'desc' },
    });

    return data.map(this.toEntity);
  }
}
