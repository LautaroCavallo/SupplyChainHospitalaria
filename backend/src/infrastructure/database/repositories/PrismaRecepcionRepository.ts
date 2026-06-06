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

  async procesarStock(id: string, usuarioId?: string): Promise<Recepcion> {
    return prisma.$transaction(async (tx) => {
      const recepcion = await tx.recepcion.findUnique({
        where: { id },
        include: {
          proveedor: true,
          detalles: { include: { producto: true } },
        },
      });

      if (!recepcion) {
        throw new Error(`Recepción con id ${id} no encontrada`);
      }

      const ingresosExistentes = await tx.movimientoStock.count({
        where: {
          tipo: 'INGRESO',
          referencia: id,
        },
      });

      if (ingresosExistentes > 0) {
        return tx.recepcion.update({
          where: { id },
          data: { estado: 'CONFIRMADA', usuarioId: usuarioId ?? recepcion.usuarioId },
          include: {
            proveedor: true,
            detalles: { include: { producto: true } },
          },
        }) as any;
      }

      for (const detalle of recepcion.detalles) {
        const loteExistente = await tx.lote.findUnique({
          where: {
            productoId_numeroLote: {
              productoId: detalle.productoId,
              numeroLote: detalle.lote,
            },
          },
        });

        const lote = loteExistente
          ? await tx.lote.update({
              where: { id: loteExistente.id },
              data: {
                stockInicial: { increment: detalle.cantidad },
                stockDisponible: { increment: detalle.cantidad },
                fechaVencimiento: detalle.fechaVencimiento,
                estado: 'VIGENTE',
              },
            })
          : await tx.lote.create({
              data: {
                productoId: detalle.productoId,
                numeroLote: detalle.lote,
                fechaVencimiento: detalle.fechaVencimiento,
                stockInicial: detalle.cantidad,
                stockDisponible: detalle.cantidad,
                estado: 'VIGENTE',
              },
            });

        await tx.productoInventario.update({
          where: { id: detalle.productoId },
          data: { stockActual: { increment: detalle.cantidad } },
        });

        await tx.movimientoStock.create({
          data: {
            productoId: detalle.productoId,
            loteId: lote.id,
            tipo: 'INGRESO',
            cantidad: detalle.cantidad,
            motivo: `Recepción ${recepcion.id} - Remito: ${recepcion.remito ?? 'S/N'}`,
            referencia: recepcion.id,
            usuarioId: usuarioId ?? recepcion.usuarioId ?? null,
          },
        });
      }

      return tx.recepcion.update({
        where: { id },
        data: { estado: 'CONFIRMADA', usuarioId: usuarioId ?? recepcion.usuarioId },
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
