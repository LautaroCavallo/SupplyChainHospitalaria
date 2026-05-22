import prisma from '../prisma-client';
import { ILoteRepository, CreateLoteData, UpdateLoteData } from '../../../domain/repositories/ILoteRepository';
import { Lote } from '../../../domain/entities/Lote';

export class PrismaLoteRepository implements ILoteRepository {
  private toEntity(raw: any): Lote {
    return new Lote(raw);
  }

  async findByProductoId(productoId: string): Promise<Lote[]> {
    const data = await prisma.lote.findMany({
      where: { productoId },
      orderBy: { fechaVencimiento: 'asc' },
    });
    return data.map(this.toEntity);
  }

  async findById(id: string): Promise<Lote | null> {
    const data = await prisma.lote.findUnique({
      where: { id },
      include: { producto: true },
    });
    return data ? this.toEntity(data) : null;
  }

  async create(data: CreateLoteData): Promise<Lote> {
    const created = await prisma.lote.create({ data });
    return this.toEntity(created);
  }

  async update(id: string, data: UpdateLoteData): Promise<Lote> {
    const updated = await prisma.lote.update({ where: { id }, data });
    return this.toEntity(updated);
  }

  async findVencidos(): Promise<Lote[]> {
    const data = await prisma.lote.findMany({
      where: {
        fechaVencimiento: { lt: new Date() },
        estado: 'VIGENTE',
      },
      include: { producto: true },
      orderBy: { fechaVencimiento: 'asc' },
    });
    return data.map(this.toEntity);
  }

  async findProximosAVencer(dias: number = 90): Promise<Lote[]> {
    const now = new Date();
    const limite = new Date();
    limite.setDate(limite.getDate() + dias);

    const data = await prisma.lote.findMany({
      where: {
        fechaVencimiento: { gte: now, lte: limite },
        estado: 'VIGENTE',
      },
      include: { producto: true },
      orderBy: { fechaVencimiento: 'asc' },
    });
    return data.map(this.toEntity);
  }

  async updateStock(id: string, cantidad: number): Promise<Lote> {
    const updated = await prisma.lote.update({
      where: { id },
      data: { stockDisponible: cantidad },
    });
    return this.toEntity(updated);
  }
}
