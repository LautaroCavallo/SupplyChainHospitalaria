import prisma from '../prisma-client';
import { IInventarioRepository, FiltrosInventario, CreateProductoData, UpdateProductoData } from '../../../domain/repositories/IInventarioRepository';
import { ProductoInventario } from '../../../domain/entities/ProductoInventario';

export class PrismaInventarioRepository implements IInventarioRepository {
  private toEntity(raw: any): ProductoInventario {
    return new ProductoInventario({
      ...raw,
      proveedorId: raw.proveedorId ?? undefined,
    });
  }

  private buildWhere(filtros: FiltrosInventario & { busqueda?: string } = {}): any {
    const { nombre, busqueda, categoria, activo = true, proveedorId } = filtros;
    const where: any = { activo };

    const searchTerm = busqueda || nombre;
    if (searchTerm) {
      where.OR = [
        { nombre: { contains: searchTerm } },
        { principioActivo: { contains: searchTerm } },
      ];
    }

    if (categoria) where.categoria = categoria;
    if (proveedorId) where.proveedorId = proveedorId;

    return where;
  }

  async findAll(filtros: FiltrosInventario = {}): Promise<ProductoInventario[]> {
    const { nivelStock, page = 1, limit = 20 } = filtros;
    const where = this.buildWhere(filtros);

    const data = await prisma.productoInventario.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: { proveedor: true },
      orderBy: { nombre: 'asc' },
    });

    let results = data.map(this.toEntity);

    if (nivelStock) {
      results = results.filter((p) => p.getNivelStock() === nivelStock);
    }

    return results;
  }

  async findById(id: string): Promise<ProductoInventario | null> {
    const data = await prisma.productoInventario.findUnique({
      where: { id },
      include: {
        proveedor: true,
        lotes: { where: { estado: 'VIGENTE' }, orderBy: { fechaVencimiento: 'asc' } },
      },
    });
    return data ? this.toEntity(data) : null;
  }

  async findByEan(ean: string): Promise<ProductoInventario | null> {
    const data = await prisma.productoInventario.findUnique({
      where: { ean },
      include: { proveedor: true },
    });
    return data ? this.toEntity(data) : null;
  }

  async findByTroquel(troquel: string): Promise<ProductoInventario | null> {
    const data = await prisma.productoInventario.findUnique({
      where: { troquel },
      include: { proveedor: true },
    });
    return data ? this.toEntity(data) : null;
  }

  async create(data: CreateProductoData): Promise<ProductoInventario> {
    const created = await prisma.productoInventario.create({
      data,
      include: { proveedor: true },
    });
    return this.toEntity(created);
  }

  async update(id: string, data: UpdateProductoData): Promise<ProductoInventario> {
    const updated = await prisma.productoInventario.update({
      where: { id },
      data,
      include: { proveedor: true },
    });
    return this.toEntity(updated);
  }

  async updateStock(id: string, cantidad: number): Promise<ProductoInventario> {
    const updated = await prisma.productoInventario.update({
      where: { id },
      data: { stockActual: cantidad },
      include: { proveedor: true },
    });
    return this.toEntity(updated);
  }

  async count(filtros: FiltrosInventario = {}): Promise<number> {
    const where = this.buildWhere(filtros);
    return prisma.productoInventario.count({ where });
  }

  async findStockCritico(): Promise<ProductoInventario[]> {
    const data = await prisma.productoInventario.findMany({
      where: { activo: true },
      include: { proveedor: true },
    });
    return data.map(this.toEntity).filter((p) => p.isStockCritico());
  }

  async findStockBajo(): Promise<ProductoInventario[]> {
    const data = await prisma.productoInventario.findMany({
      where: { activo: true },
      include: { proveedor: true },
    });
    return data.map(this.toEntity).filter((p) => p.isStockBajo());
  }

  async findSinStock(): Promise<ProductoInventario[]> {
    const data = await prisma.productoInventario.findMany({
      where: { activo: true, stockActual: 0 },
      include: { proveedor: true },
    });
    return data.map(this.toEntity);
  }
}
