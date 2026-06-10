import prisma from '../prisma-client';
import { ISolicitudCompraRepository, FiltrosSolicitudCompra, CreateSolicitudCompraData, UpdateSolicitudCompraData } from '../../../domain/repositories/ISolicitudCompraRepository';
import { SolicitudCompra } from '../../../domain/entities/SolicitudCompra';

const solicitudInclude = {
  detalles: { include: { producto: true } },
  proveedorSugerido: true,
} as const;

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
      include: solicitudInclude,
      orderBy: { createdAt: 'desc' },
    }) as any;
  }

  async findById(id: string): Promise<SolicitudCompra | null> {
    return prisma.solicitudCompra.findUnique({
      where: { id },
      include: solicitudInclude,
    }) as any;
  }

  async create(data: CreateSolicitudCompraData): Promise<SolicitudCompra> {
    const { detalles, ...solicitudData } = data;

    return prisma.solicitudCompra.create({
      data: {
        ...solicitudData,
        detalles: {
          create: detalles.map((d) => ({
            productoId: d.productoId,
            cantidadSolicitada: d.cantidadSolicitada,
            unidad: d.unidad ?? 'unidad',
          })),
        },
      },
      include: solicitudInclude,
    }) as any;
  }

  async update(id: string, data: UpdateSolicitudCompraData): Promise<SolicitudCompra> {
    const { detalles, ...updateData } = data;

    // Actualizar la cabecera
    await prisma.solicitudCompra.update({
      where: { id },
      data: updateData,
    });

    // Actualizar detalles individualmente si se proporcionaron
    if (detalles && detalles.length > 0) {
      for (const detalle of detalles) {
        const updateDetalle: any = {};
        if (detalle.cantidadAprobada !== undefined) updateDetalle.cantidadAprobada = detalle.cantidadAprobada;
        if (detalle.precioUnitario !== undefined) updateDetalle.precioUnitario = detalle.precioUnitario;
        if (detalle.cantidadSolicitada !== undefined) updateDetalle.cantidadSolicitada = detalle.cantidadSolicitada;

        if (Object.keys(updateDetalle).length > 0) {
          await prisma.solicitudCompraDetalle.updateMany({
            where: { solicitudId: id, productoId: detalle.productoId },
            data: updateDetalle,
          });
        }
      }
    }

    return prisma.solicitudCompra.findUniqueOrThrow({
      where: { id },
      include: solicitudInclude,
    }) as any;
  }
}
