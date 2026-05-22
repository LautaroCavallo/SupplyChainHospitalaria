import prisma from '../prisma-client';
import { IMovimientoStockRepository, FiltrosMovimiento, CreateMovimientoData } from '../../../domain/repositories/IMovimientoStockRepository';
import { MovimientoStock } from '../../../domain/entities/MovimientoStock';

export class PrismaMovimientoStockRepository implements IMovimientoStockRepository {
  private toEntity(raw: any): MovimientoStock {
    return new MovimientoStock(raw);
  }

  async findByProductoId(productoId: string, filtros: FiltrosMovimiento = {}): Promise<MovimientoStock[]> {
    const { tipo, fechaDesde, fechaHasta, page = 1, limit = 20 } = filtros;
    const where: any = { productoId };

    if (tipo) where.tipo = tipo;
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

  async findAll(filtros: FiltrosMovimiento = {}): Promise<MovimientoStock[]> {
    const { tipo, fechaDesde, fechaHasta, usuarioId, page = 1, limit = 20 } = filtros;
    const where: any = {};

    if (tipo) where.tipo = tipo;
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
