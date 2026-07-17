import { AppError, NotFoundError } from '../../../application/errors/AppError';
import { config } from '../../../config';
import { CoreClient } from '../core/CoreClient';
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

/**
 * Adapter real hacia HCE (Módulo 1) para la dispensación de recetas.
 *  - validarReceta  → GET   /api/v1/recetas/{id}            (estado + items + alertas)
 *  - consumirReceta → PATCH /api/v1/recetas/{id}/dispensar  (marca Dispensada en HCE)
 *
 * HCE exige JWT de Core. Usamos el token del usuario entrante y, si no hay o da 401,
 * caemos al token de servicio de Farmacia (CoreClient).
 */
export class HceRecetaService implements IRecetaService {
  private readonly baseUrl = config.integrations.hceApiUrl.replace(/\/$/, '');

  constructor(
    private readonly getUserToken: () => string | undefined,
    private readonly coreClient: CoreClient,
  ) {}

  get enabled(): boolean {
    return Boolean(this.baseUrl);
  }

  async validarReceta(recetaId: string): Promise<RecetaValidacion> {
    const numericId = this.numericId(recetaId);
    const receta = await this.request<HceReceta>(this.apiPath(`/recetas/${numericId}`), 'GET');
    const errores: string[] = [];

    if (receta.estado !== 'Activa') {
      errores.push(`La receta está en estado ${receta.estado}`);
    }

    // Las alertas clínicas no invalidan la receta: se muestran para que el
    // farmacéutico decida si dispensa igualmente, previa confirmación.
    const alertas = (receta.alertas_clinicas ?? []).map((alerta) => this.describirAlerta(alerta));

    const consumida = receta.estado === 'Dispensada';
    return {
      recetaId: String(receta.id_receta),
      valida: receta.estado === 'Activa' && errores.length === 0,
      pacienteId: String(receta.id_paciente),
      pacienteNombre: `Paciente ${receta.id_paciente}`,
      medicoId: receta.id_evolucion ? String(receta.id_evolucion) : 'HCE',
      medicoNombre: 'Historia Clínica Electrónica',
      items: (receta.items ?? []).map((item) => ({
        productoId: '', // el mapeo medicamento→producto lo resuelve el farmacéutico al dispensar
        nombre: item.medicamento,
        medicamento: item.medicamento,
        cantidad: item.cantidad ?? 1,
        indicaciones: item.indicaciones ?? undefined,
      })),
      errores,
      alertas,
      consumida,
      estado: consumida ? 'Consumida' : receta.estado === 'Activa' ? 'Activa' : 'Vencida',
    };
  }

  async consumirReceta(recetaId: string, items: ItemConsumo[]): Promise<ResultadoConsumo> {
    const numericId = this.numericId(recetaId);
    try {
      // Marca la receta como Dispensada en HCE. El descuento de stock lo hace el caso de uso.
      await this.request<HceReceta>(this.apiPath(`/recetas/${numericId}/dispensar`), 'PATCH');
    } catch (err) {
      return { exitoso: false, recetaId, itemsConsumidos: [], errores: [(err as Error).message] };
    }
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

  /** HCE no documenta un shape fijo para las alertas clínicas; se intenta extraer un mensaje legible. */
  private describirAlerta(alerta: unknown): string {
    if (typeof alerta === 'string') return alerta;
    if (alerta && typeof alerta === 'object') {
      const obj = alerta as Record<string, unknown>;
      const mensaje = obj.mensaje ?? obj.descripcion ?? obj.detalle ?? obj.tipo;
      if (typeof mensaje === 'string') return mensaje;
    }
    return 'Alerta clínica activa';
  }

  private numericId(recetaId: string): number {
    const n = Number(recetaId);
    if (!Number.isInteger(n)) throw new AppError('HCE espera id_receta numérico', 400);
    return n;
  }

  /** Resuelve un token válido: el del usuario o, si falta, el de servicio de Core. */
  private async resolveToken(force = false): Promise<string | undefined> {
    if (!force) {
      const user = this.getUserToken();
      if (user) return user;
    }
    return this.coreClient.enabled ? this.coreClient.getServiceToken(force) : undefined;
  }

  private async request<T>(path: string, method: 'GET' | 'PATCH'): Promise<T> {
    const doFetch = async (token?: string) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.integrations.externalTimeoutMs);
      try {
        return await fetch(`${this.baseUrl}${path}`, {
          method,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      } finally {
        clearTimeout(timeout);
      }
    };

    let response = await doFetch(await this.resolveToken());
    if (response.status === 401) {
      response = await doFetch(await this.resolveToken(true)); // token vencido → forzar servicio
    }

    if (response.status === 404) throw new NotFoundError('Receta no encontrada en HCE');
    if (!response.ok) {
      throw new AppError(`HCE respondió ${response.status}`, response.status === 401 ? 401 : 502);
    }
    return (await response.json()) as T;
  }

  private apiPath(path: string): string {
    return this.baseUrl.endsWith('/api/v1') ? path : `/api/v1${path}`;
  }
}
