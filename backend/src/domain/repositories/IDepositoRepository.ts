import { Deposito, TipoDeposito } from '../entities/Deposito';

export interface CreateDepositoData {
  nombre: string;
  tipo?: TipoDeposito;
  descripcion?: string;
}

export interface UpdateDepositoData {
  nombre?: string;
  tipo?: TipoDeposito;
  descripcion?: string;
  activo?: boolean;
}

/** Stock de un producto en un depósito puntual. */
export interface StockPorDeposito {
  depositoId: string;
  depositoNombre: string;
  depositoTipo: TipoDeposito;
  stock: number;
}

export interface TransferenciaData {
  productoId: string;
  depositoOrigenId: string;
  depositoDestinoId: string;
  cantidad: number;
  usuarioId?: string;
}

export interface IDepositoRepository {
  findAll(soloActivos?: boolean): Promise<Deposito[]>;
  findById(id: string): Promise<Deposito | null>;
  create(data: CreateDepositoData): Promise<Deposito>;
  update(id: string, data: UpdateDepositoData): Promise<Deposito>;
  /** Stock de un producto desglosado por depósito (suma de lotes con stock). */
  stockPorProducto(productoId: string): Promise<StockPorDeposito[]>;
  /** Transfiere stock de un depósito a otro (FEFO en origen). Devuelve unidades movidas. */
  transferir(data: TransferenciaData): Promise<number>;
}
