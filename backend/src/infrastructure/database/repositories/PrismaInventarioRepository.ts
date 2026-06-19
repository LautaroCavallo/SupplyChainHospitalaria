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
    const { nombre, busqueda, categoria, activo, proveedorId, genericoId } = filtros;
    const where: any = {};

    // Solo filtrar por activo cuando se especifica explícitamente (true/false).
    // Si es undefined, devuelve tanto activos como inactivos.
    if (activo !== undefined) where.activo = activo;

    const searchTerm = busqueda || nombre;
    if (searchTerm) {
      where.OR = [
        { nombre: { contains: searchTerm } },
        { principioActivo: { contains: searchTerm } },
        { generico: { is: { nombre: { contains: searchTerm } } } },
        { generico: { is: { principioActivo: { contains: searchTerm } } } },
      ];
    }

    if (categoria) where.categoria = categoria;
    if (proveedorId) where.proveedorId = proveedorId;
    if (genericoId) where.genericoId = genericoId;

    return where;
  }

  async findAll(filtros: FiltrosInventario = {}): Promise<ProductoInventario[]> {
    const { nivelStock, page = 1, limit = 20 } = filtros;
    const where = this.buildWhere(filtros);

    const data = await prisma.productoInventario.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: { proveedor: true, generico: true },
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
        generico: true,
        lotes: { where: { estado: 'VIGENTE' }, orderBy: { fechaVencimiento: 'asc' } },
      },
    });
    return data ? this.toEntity(data) : null;
  }

  async findByEan(ean: string): Promise<ProductoInventario | null> {
    const data = await prisma.productoInventario.findUnique({
      where: { ean },
      include: { proveedor: true, generico: true },
    });
    return data ? this.toEntity(data) : null;
  }

  async findByTroquel(troquel: string): Promise<ProductoInventario | null> {
    const data = await prisma.productoInventario.findUnique({
      where: { troquel },
      include: { proveedor: true, generico: true },
    });
    return data ? this.toEntity(data) : null;
  }

  async findByGenerico(nombreGenerico: string): Promise<ProductoInventario[]> {
    const search = nombreGenerico.trim();
    const data = await prisma.productoInventario.findMany({
      where: {
        activo: true,
        categoria: 'MEDICAMENTO',
        OR: [
          { nombre: { contains: search } },
          { principioActivo: { contains: search } },
          { generico: { is: { nombre: { contains: search } } } },
          { generico: { is: { principioActivo: { contains: search } } } },
          { generico: { is: { nombreNormalizado: { contains: search.toLowerCase() } } } },
        ],
      },
      include: { proveedor: true, generico: true },
      orderBy: [{ stockActual: 'desc' }, { nombre: 'asc' }],
    });
    return data.map(this.toEntity);
  }

  async findByGenericoConStockFefo(nombreGenerico: string, cantidad: number): Promise<ProductoInventario | null> {
    const search = nombreGenerico.trim();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const data = await prisma.productoInventario.findMany({
      where: {
        activo: true,
        categoria: 'MEDICAMENTO',
        stockActual: { gte: cantidad },
        OR: [
          { nombre: { contains: search } },
          { principioActivo: { contains: search } },
          { generico: { is: { nombre: { contains: search } } } },
          { generico: { is: { principioActivo: { contains: search } } } },
          { generico: { is: { nombreNormalizado: { contains: search.toLowerCase() } } } },
        ],
      },
      include: {
        proveedor: true,
        generico: true,
        lotes: {
          where: {
            stockDisponible: { gt: 0 },
            fechaVencimiento: { gte: today },
          },
          orderBy: [
            { fechaVencimiento: 'asc' },
            { createdAt: 'asc' },
          ],
        },
      },
    });

    const candidates = data
      .map((producto) => ({
        producto,
        stockDisponibleEnLotes: producto.lotes.reduce((total, lote) => total + lote.stockDisponible, 0),
        fechaMasProxima: producto.lotes[0]?.fechaVencimiento,
      }))
      .filter((candidate) => candidate.stockDisponibleEnLotes >= cantidad && candidate.fechaMasProxima)
      .sort((a, b) => {
        const byFecha = a.fechaMasProxima.getTime() - b.fechaMasProxima.getTime();
        return byFecha !== 0 ? byFecha : a.producto.nombre.localeCompare(b.producto.nombre);
      });

    return candidates[0] ? this.toEntity(candidates[0].producto) : null;
  }

  async create(data: CreateProductoData): Promise<ProductoInventario> {
    const created = await prisma.productoInventario.create({
      data,
      include: { proveedor: true, generico: true },
    });
    return this.toEntity(created);
  }

  async update(id: string, data: UpdateProductoData): Promise<ProductoInventario> {
    const updated = await prisma.productoInventario.update({
      where: { id },
      data,
      include: { proveedor: true, generico: true },
    });
    return this.toEntity(updated);
  }

  async updateStock(id: string, cantidad: number): Promise<ProductoInventario> {
    const updated = await prisma.productoInventario.update({
      where: { id },
      data: { stockActual: cantidad },
      include: { proveedor: true, generico: true },
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
      include: { proveedor: true, generico: true },
    });
    return data.map(this.toEntity).filter((p) => p.isStockCritico());
  }

  async findStockBajo(): Promise<ProductoInventario[]> {
    const data = await prisma.productoInventario.findMany({
      where: { activo: true },
      include: { proveedor: true, generico: true },
    });
    return data.map(this.toEntity).filter((p) => p.isStockBajo());
  }

  async findSinStock(): Promise<ProductoInventario[]> {
    const data = await prisma.productoInventario.findMany({
      where: { activo: true, stockActual: 0 },
      include: { proveedor: true, generico: true },
    });
    return data.map(this.toEntity);
  }
}
