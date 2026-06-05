import { ProductoInventario, CategoriaProducto, NivelStock } from '../entities/ProductoInventario';

export interface FiltrosInventario {
  nombre?: string;
  categoria?: CategoriaProducto;
  nivelStock?: NivelStock;
  activo?: boolean;
  proveedorId?: string;
  genericoId?: string;
  page?: number;
  limit?: number;
}

export interface CreateProductoData {
  nombre: string;
  descripcion?: string;
  principioActivo?: string;
  presentacion?: string;
  categoria: CategoriaProducto;
  ean?: string;
  troquel?: string;
  stockMinimo?: number;
  stockCritico?: number;
  unidad: string;
  proveedorId?: string;
  genericoId?: string;
}

export interface UpdateProductoData {
  nombre?: string;
  descripcion?: string;
  principioActivo?: string;
  presentacion?: string;
  categoria?: CategoriaProducto;
  ean?: string;
  troquel?: string;
  stockMinimo?: number;
  stockCritico?: number;
  unidad?: string;
  proveedorId?: string;
  genericoId?: string;
  activo?: boolean;
}

export interface IInventarioRepository {
  findAll(filtros?: FiltrosInventario): Promise<ProductoInventario[]>;
  findById(id: string): Promise<ProductoInventario | null>;
  findByEan(ean: string): Promise<ProductoInventario | null>;
  findByTroquel(troquel: string): Promise<ProductoInventario | null>;
  findByGenerico(nombreGenerico: string): Promise<ProductoInventario[]>;
  create(data: CreateProductoData): Promise<ProductoInventario>;
  update(id: string, data: UpdateProductoData): Promise<ProductoInventario>;
  updateStock(id: string, cantidad: number): Promise<ProductoInventario>;
  count(filtros?: FiltrosInventario): Promise<number>;
  findStockCritico(): Promise<ProductoInventario[]>;
  findSinStock(): Promise<ProductoInventario[]>;
  findStockBajo(): Promise<ProductoInventario[]>;
}
