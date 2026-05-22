import { Proveedor } from '../entities/Proveedor';

export interface FiltrosProveedor {
  razonSocial?: string;
  cuit?: string;
  activo?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateProveedorData {
  razonSocial: string;
  cuit: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
}

export interface UpdateProveedorData {
  razonSocial?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  activo?: boolean;
}

export interface IProveedorRepository {
  findAll(filtros?: FiltrosProveedor): Promise<Proveedor[]>;
  findById(id: string): Promise<Proveedor | null>;
  findByCuit(cuit: string): Promise<Proveedor | null>;
  create(data: CreateProveedorData): Promise<Proveedor>;
  update(id: string, data: UpdateProveedorData): Promise<Proveedor>;
  delete(id: string): Promise<void>;
  count(filtros?: FiltrosProveedor): Promise<number>;
}
