import prisma from '../prisma-client';
import {
  INotificacionRepository,
  CreateNotificacionData,
  NotificacionEntity,
} from '../../../domain/repositories/INotificacionRepository';

export class PrismaNotificacionRepository implements INotificacionRepository {
  async findAll(): Promise<NotificacionEntity[]> {
    return prisma.notificacion.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async create(data: CreateNotificacionData): Promise<NotificacionEntity> {
    return prisma.notificacion.create({
      data: {
        tipo: data.tipo,
        titulo: data.titulo,
        descripcion: data.descripcion,
        referencia: data.referencia ?? null,
        usuarioId: data.usuarioId ?? null,
      },
    });
  }

  async marcarTodasLeidas(): Promise<void> {
    await prisma.notificacion.updateMany({
      where: { leida: false },
      data: { leida: true },
    });
  }

  async crearSiNoExiste(data: CreateNotificacionData & { referencia: string }): Promise<void> {
    const count = await prisma.notificacion.count({
      where: { tipo: data.tipo, referencia: data.referencia, leida: false },
    });
    if (count === 0) {
      await this.create(data);
    }
  }
}
