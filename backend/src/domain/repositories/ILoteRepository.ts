import { Lote } from '../entities/Lote';

export interface CreateLoteData {
  numeroLote: string;
  productoId: string;
  fechaVencimiento: Date;
  stockDisponible: number;
  stockInicial: number;
}

export interface UpdateLoteData {
  numeroLote?: string;
  fechaVencimiento?: Date;
  estado?: 'VIGENTE' | 'PROXIMO_A_VENCER' | 'VENCIDO';
}

export interface ILoteRepository {
  findByProductoId(productoId: string): Promise<Lote[]>;
  findById(id: string): Promise<Lote | null>;
  create(data: CreateLoteData): Promise<Lote>;
  update(id: string, data: UpdateLoteData): Promise<Lote>;
  findVencidos(): Promise<Lote[]>;
  findProximosAVencer(dias?: number): Promise<Lote[]>;
  updateStock(id: string, cantidad: number): Promise<Lote>;
}
