import { AppError, NotFoundError } from '../../../application/errors/AppError';
import { config } from '../../../config';
import {
  IRecetaService,
  ItemConsumo,
  RecetaValidacion,
  ResultadoConsumo,
} from '../../../domain/services/IRecetaService';

interface HceItemReceta {
  id_item?: number;
  id_receta?: number;
  medicamento: string;
  indicaciones?: string | null;
  cantidad?: number;
}

interface HceReceta {
  id_receta: number;
  id_paciente: number;
  id_evolucion?: number | null;
  estado: 'Activa' | 'Suspendida' | 'Dispensada' | string;
  items?: HceItemReceta[];
  alertas_clinicas?: unknown[];
}

export class HceRecetaService implements IRecetaService {
  private readonly baseUrl = config.integrations.hceApiUrl.replace(/\/$/, '');

  constructor(private readonly getToken: () => string | undefined) {}

  get enabled(): boolean {
    return Boolean(this.baseUrl);
  }

  async validarReceta(recetaId: string): Promise<RecetaValidacion> {
    const numericId = Number(recetaId);
    if (!Number.isInteger(numericId)) {
      throw new AppError('HCE espera id_receta numérico', 400);
    }

    const receta = await this.request<HceReceta>(this.apiPath(`/recetas/${numericId}`));
    const errores: string[] = [];

    if (receta.estado !== 'Activa') {
      errores.push(`La receta está en estado ${receta.estado}`);
    }

    if ((receta.alertas_clinicas?.length ?? 0) > 0) {
      errores.push('La receta contiene alertas clínicas activas');
    }

    const consumida = receta.estado === 'Dispensada';
    return {
      recetaId: String(receta.id_receta),
      valida: receta.estado === 'Activa' && errores.length === 0,
      pacienteId: String(receta.id_paciente),
      pacienteNombre: `Paciente ${receta.id_paciente}`,
      medicoId: receta.id_evolucion ? String(receta.id_evolucion) : 'HCE',
      medicoNombre: 'Historia Clínica Electrónica',
      items: (receta.items ?? []).map((item) => ({
        productoId: '',
        nombre: item.medicamento,
        medicamento: item.medicamento,
        cantidad: item.cantidad ?? 1,
        indicaciones: item.indicaciones ?? undefined,
      })),
      errores,
      consumida,
      estado: consumida ? 'Consumida' : receta.estado === 'Activa' ? 'Activa' : 'Vencida',
    };
  }

  async consumirReceta(recetaId: string, items: ItemConsumo[]): Promise<ResultadoConsumo> {
    return {
      exitoso: true,
      recetaId,
      itemsConsumidos: items.map((item) => ({
        productoId: item.productoId,
        cantidadConsumida: item.cantidad,
        loteId: item.loteId,
        exitoso: true,
      })),
      errores: [],
    };
  }

  private async request<T>(path: string): Promise<T> {
    const token = this.getToken();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.integrations.externalTimeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.status === 404) {
        throw new NotFoundError('Receta no encontrada en HCE');
      }

      if (!response.ok) {
        throw new AppError(`HCE respondió ${response.status}`, response.status === 401 ? 401 : 502);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  private apiPath(path: string): string {
    return this.baseUrl.endsWith('/api/v1') ? path : `/api/v1${path}`;
  }
}
