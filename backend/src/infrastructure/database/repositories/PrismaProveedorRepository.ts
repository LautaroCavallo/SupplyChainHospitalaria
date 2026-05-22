import prisma from '../prisma-client';
import { IProveedorRepository, FiltrosProveedor, CreateProveedorData, UpdateProveedorData } from '../../../domain/repositories/IProveedorRepository';
import { Proveedor } from '../../../domain/entities/Proveedor';

export class PrismaProveedorRepository implements IProveedorRepository {
  private toEntity(raw: any): Proveedor {
    return new Proveedor(raw);
  }

  private buildWhere(filtros: FiltrosProveedor & { busqueda?: string } = {}): any {
    const { razonSocial, cuit, activo, busqueda } = filtros;
    const where: any = {};

    if (activo !== undefined) where.activo = activo;

    if (busqueda) {
      where.OR = [
        { razonSocial: { contains: busqueda } },
        { cuit: { contains: busqueda } },
      ];
    } else {
      if (razonSocial) where.razonSocial = { contains: razonSocial };
      if (cuit) where.cuit = { contains: cuit };
    }

    return where;
  }

  async findAll(filtros: FiltrosProveedor = {}): Promise<Proveedor[]> {
    const { page = 1, limit = 20 } = filtros;
    const where = this.buildWhere(filtros);

    const data = await prisma.proveedor.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { razonSocial: 'asc' },
    });

    return data.map(this.toEntity);
  }

  async findById(id: string): Promise<Proveedor | null> {
    const data = await prisma.proveedor.findUnique({ where: { id } });
    return data ? this.toEntity(data) : null;
  }

  async findByCuit(cuit: string): Promise<Proveedor | null> {
    const data = await prisma.proveedor.findUnique({ where: { cuit } });
    return data ? this.toEntity(data) : null;
  }

  async create(data: CreateProveedorData): Promise<Proveedor> {
    const created = await prisma.proveedor.create({ data });
    return this.toEntity(created);
  }

  async update(id: string, data: UpdateProveedorData): Promise<Proveedor> {
    const updated = await prisma.proveedor.update({ where: { id }, data });
    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.proveedor.update({
      where: { id },
      data: { activo: false },
    });
  }

  async count(filtros: FiltrosProveedor = {}): Promise<number> {
    const where = this.buildWhere(filtros);
    return prisma.proveedor.count({ where });
  }
}
