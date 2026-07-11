import { AppError } from '../../../application/errors/AppError';
import { config } from '../../../config';
import logger from '../../../config/logger';

/**
 * Cliente autenticado hacia Core (Módulo 10) para la mensajería de Health Grid.
 *
 * Modelo del sistema (ver manual de Core): RabbitMQ mediado por Core.
 *  - PUBLICAR eventos  → se hace llamando a Core `POST /events/log` (Core publica en RabbitMQ).
 *  - CONFIGURAR colas/eventos/bindings → vía Core (`/rabbit/queues`, `/events/types`, `/rabbit/bindings`).
 *  - ESCUCHAR → se consume directo de RabbitMQ (ver RabbitConsumer), no de acá.
 *
 * Maneja un token de servicio (login con credenciales de Farmacia) y lo renueva ante un 401.
 */
export class CoreClient {
  private readonly baseUrl = config.integrations.coreApiUrl.replace(/\/$/, '');
  private token: string | null = null;

  get enabled(): boolean {
    return Boolean(this.baseUrl);
  }

  /** Token de servicio válido (para autenticar llamadas REST a otros módulos, ej. Módulo 7). */
  async getServiceToken(force = false): Promise<string> {
    return this.ensureToken(force);
  }

  /** Obtiene (y cachea) el token de servicio; con force=true fuerza un re-login. */
  private async ensureToken(force = false): Promise<string> {
    if (this.token && !force) return this.token;
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: config.integrations.coreServiceEmail,
        password: config.integrations.coreServicePassword,
      }),
    });
    if (!res.ok) throw new AppError(`Login de servicio en Core falló (HTTP ${res.status})`, 502);
    const data = (await res.json()) as { token?: string };
    if (!data.token) throw new AppError('Core no devolvió token de servicio', 502);
    this.token = data.token;
    logger.info('CoreClient autenticado en Core');
    return this.token;
  }

  private async call<T>(path: string, method: string, body?: unknown, retryOn401 = true): Promise<T> {
    const token = await this.ensureToken();
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401 && retryOn401) {
      await this.ensureToken(true); // token vencido → re-login y reintento
      return this.call<T>(path, method, body, false);
    }
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new AppError(`Core ${method} ${path} → HTTP ${res.status} ${detail.slice(0, 120)}`, res.status >= 500 ? 502 : res.status);
    }
    return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
  }

  // ---- Publicación de eventos (request/response) ----

  /**
   * Publica un evento en el bus. Core lo enruta a la cola bindeada al event_type_id.
   * `payload` se envía como STRING JSON (requisito de Core). `correlationId` se
   * inyecta en el payload para poder matchear la respuesta.
   */
  async publishEvent(eventTypeId: number, payload: Record<string, unknown>, correlationId?: string): Promise<unknown> {
    const body = correlationId ? { correlation_id: correlationId, ...payload } : payload;
    return this.call('/events/log', 'POST', {
      event_type_id: eventTypeId,
      publisher_module: config.integrations.publisherModule,
      payload: JSON.stringify(body),
    });
  }

  // ---- Configuración (setup de colas/eventos/bindings) ----

  async createQueue(queueName: string, queueType: 'requests' | 'responses'): Promise<unknown> {
    return this.call('/rabbit/queues', 'POST', { queue_name: queueName, queue_type: queueType });
  }

  async createEventType(name: string, sourceModule: string, description?: string): Promise<unknown> {
    return this.call('/events/types', 'POST', { name, source_module: sourceModule, description });
  }

  async createBinding(eventId: number, queueName: string): Promise<unknown> {
    return this.call('/rabbit/bindings', 'POST', { event_id: eventId, queue_name: queueName });
  }

  async listEventTypes(): Promise<unknown> {
    return this.call('/events/types', 'GET');
  }
}
