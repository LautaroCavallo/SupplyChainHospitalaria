export interface RecetaValidacion {
  recetaId: string;
  valida: boolean;
  pacienteId: string;
  pacienteNombre: string;
  medicoId: string;
  medicoNombre: string;
  items: RecetaItem[];
  errores: string[];
  consumida: boolean;
  estado: 'Activa' | 'Consumida' | 'Vencida';
}

export interface RecetaItem {
  productoId: string;
  nombre: string;
  medicamento?: string;
  cantidad: number;
  indicaciones?: string;
}

export interface ItemConsumo {
  productoId: string;
  loteId?: string;
  cantidad: number;
}

export interface ResultadoConsumo {
  exitoso: boolean;
  recetaId: string;
  itemsConsumidos: ItemConsumoResultado[];
  errores: string[];
}

export interface ItemConsumoResultado {
  productoId: string;
  cantidadConsumida: number;
  loteId?: string;
  exitoso: boolean;
  error?: string;
}

export interface IRecetaService {
  validarReceta(recetaId: string): Promise<RecetaValidacion>;
  consumirReceta(recetaId: string, items: ItemConsumo[]): Promise<ResultadoConsumo>;
}
