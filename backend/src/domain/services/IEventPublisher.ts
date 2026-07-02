/**
 * Abstracción de publicación de eventos.
 * El dominio/aplicación depende de esta interfaz, no de Kafka directamente
 * (Adapter/Dependency Inversion). La implementación concreta vive en infrastructure.
 */
export interface IEventPublisher {
  /**
   * Publica un evento en un topic.
   * @param topic   nombre del topic (ej. 'compras.orden-solicitada')
   * @param key     clave de particionado (ej. proveedorId) — garantiza orden por entidad
   * @param payload cuerpo del evento (se serializa a JSON)
   */
  publish(topic: string, key: string, payload: unknown): Promise<void>;
}
