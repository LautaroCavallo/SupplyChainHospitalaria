import prisma from '../prisma-client';
import { IRecepcionRepository, FiltrosRecepcion, CreateRecepcionData, UpdateRecepcionData } from '../../../domain/repositories/IRecepcionRepository';
import { Recepcion } from '../../../domain/entities/Recepcion';

export class PrismaRecepcionRepository implements IRecepcionRepository {
  async findAll(filtros: FiltrosRecepcion = {}): Promise<Recepcion[]> {
    const { proveedorId, estado, fechaDesde, fechaHasta, page = 1, limit = 20 } = filtros;
    const where: any = {};

    if (estado) where.estado = estado;
    if (proveedorId) where.proveedorId = proveedorId;
    if (fechaDesde || fechaHasta) {
      where.fechaRecepcion = {};
      if (fechaDesde) where.fechaRecepcion.gte = fechaDesde;
      if (fechaHasta) where.fechaRecepcion.lte = fechaHasta;
    }

    return prisma.recepcion.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        proveedor: true,
        detalles: { include: { producto: true } },
      },
      orderBy: { createdAt: 'desc' },
    }) as any;
  }

  async findById(id: string): Promise<Recepcion | null> {
    return prisma.recepcion.findUnique({
      where: { id },
      include: {
        proveedor: true,
        detalles: { include: { producto: true } },
      },
    }) as any;
  }

  async create(data: CreateRecepcionData): Promise<Recepcion> {
    const { detalles, ...recepcionData } = data;

    return prisma.recepcion.create({
      data: {
        ...recepcionData,
        fechaRecepcion: recepcionData.fechaRecepcion ?? new Date(),
        totalItems: detalles.length,
        detalles: { create: detalles },
      },
      include: {
        proveedor: true,
        detalles: { include: { producto: true } },
      },
    }) as any;
  }

  async update(id: string, data: UpdateRecepcionData): Promise<Recepcion> {
    const { detalles, ...updateData } = data;
    const normalizedDetalles = detalles?.map((d) => ({
      productoId: d.productoId,
      cantidad: d.cantidad,
      ean: d.ean,
      troquel: d.troquel,
      lote: d.lote,
      fechaVencimiento: d.fechaVencimiento,
    }));

    return prisma.$transaction(async (tx) => {
      if (normalizedDetalles) {
        await tx.recepcionDetalle.deleteMany({ where: { recepcionId: id } });
      }

      return tx.recepcion.update({
        where: { id },
        data: {
          ...updateData,
          ...(normalizedDetalles
            ? {
                totalItems: normalizedDetalles.length,
                detalles: { create: normalizedDetalles },
              }
            : {}),
        },
        include: {
          proveedor: true,
          detalles: { include: { producto: true } },
        },
      }) as any;
    });
  }

  async count(filtros: FiltrosRecepcion = {}): Promise<number> {
    const { proveedorId, estado, fechaDesde, fechaHasta } = filtros;
    const where: any = {};

    if (estado) where.estado = estado;
    if (proveedorId) where.proveedorId = proveedorId;
    if (fechaDesde || fechaHasta) {
      where.fechaRecepcion = {};
      if (fechaDesde) where.fechaRecepcion.gte = fechaDesde;
      if (fechaHasta) where.fechaRecepcion.lte = fechaHasta;
    }

    return prisma.recepcion.count({ where });
  }
}
