import prisma from '../prisma-client';
import { ISolicitudCompraRepository, FiltrosSolicitudCompra, CreateSolicitudCompraData, UpdateSolicitudCompraData } from '../../../domain/repositories/ISolicitudCompraRepository';
import { SolicitudCompra } from '../../../domain/entities/SolicitudCompra';

export class PrismaSolicitudCompraRepository implements ISolicitudCompraRepository {
  async findAll(filtros: FiltrosSolicitudCompra = {}): Promise<SolicitudCompra[]> {
    const { estado, prioridad, usuarioId, fechaDesde, fechaHasta, page = 1, limit = 20 } = filtros;
    const where: any = {};

    if (estado) where.estado = estado;
    if (prioridad) where.prioridad = prioridad;
    if (usuarioId) where.usuarioId = usuarioId;
    if (fechaDesde || fechaHasta) {
      where.createdAt = {};
      if (fechaDesde) where.createdAt.gte = fechaDesde;
      if (fechaHasta) where.createdAt.lte = fechaHasta;
    }

    return prisma.solicitudCompra.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        detalles: { include: { producto: true } },
      },
      orderBy: { createdAt: 'desc' },
    }) as any;
  }

  async findById(id: string): Promise<SolicitudCompra | null> {
    return prisma.solicitudCompra.findUnique({
      where: { id },
      include: {
        detalles: { include: { producto: true } },
      },
    }) as any;
  }

  async create(data: CreateSolicitudCompraData): Promise<SolicitudCompra> {
    const { detalles, ...solicitudData } = data;

    return prisma.solicitudCompra.create({
      data: {
        ...solicitudData,
        detalles: { create: detalles },
      },
      include: {
        detalles: { include: { producto: true } },
      },
    }) as any;
  }

  async update(id: string, data: UpdateSolicitudCompraData): Promise<SolicitudCompra> {
    const { detalles, ...updateData } = data;

    return prisma.solicitudCompra.update({
      where: { id },
      data: updateData,
      include: {
        detalles: { include: { producto: true } },
      },
    }) as any;
  }
}
