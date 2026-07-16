import amqplib from 'amqplib';
import { config } from '../../config';
import logger from '../../config/logger';

// Tipos derivados de la versión instalada de amqplib (robusto entre versiones).
type RabbitConnection = Awaited<ReturnType<typeof amqplib.connect>>;
type RabbitChannel = Awaited<ReturnType<RabbitConnection['createChannel']>>;

/**
 * Sobre externo que publica Core en RabbitMQ (ver manual de Core).
 * OJO: `payload` llega como STRING JSON → hay que parsearlo aparte.
 */
export interface CoreEventEnvelope {
  event_type_id: number;
  event_type_name?: string;
  source_module?: string;
  publisher_module?: string;
  log_id?: number;
  payload: string;
  published_at?: string;
}

export type EventHandler = (payload: any, envelope: CoreEventEnvelope) => Promise<void>;

/**
 * Consumer de RabbitMQ para escuchar nuestras colas del sistema Health Grid.
 * En este modelo, PUBLICAR se hace vía Core (CoreClient); acá solo ESCUCHAMOS.
 * ACK al procesar OK; NACK sin requeue (→ DLQ) si el handler falla.
 */
export class RabbitConsumer {
  private conn: RabbitConnection | null = null;
  private channel: RabbitChannel | null = null;

  get enabled(): boolean {
    return Boolean(config.rabbit.url);
  }

  async connect(): Promise<void> {
    if (!this.enabled) throw new Error('RabbitMQ no configurado (RABBITMQ_URL o RABBITMQ_HOST)');
    this.conn = await amqplib.connect(config.rabbit.url);
    this.channel = await this.conn.createChannel();
    await this.channel.prefetch(config.rabbit.prefetch);
    logger.info('RabbitConsumer conectado a RabbitMQ');
  }

  /** Empieza a consumir una cola. La cola la crea Core; acá solo la escuchamos. */
  async consume(queueName: string, handler: EventHandler): Promise<void> {
    if (!this.channel) throw new Error('RabbitConsumer no conectado (llamar connect() primero)');
    await this.channel.checkQueue(queueName); // falla si la cola no existe todavía en Core
    await this.channel.consume(queueName, async (msg) => {
      if (!msg) return;
      try {
        const envelope = JSON.parse(msg.content.toString()) as CoreEventEnvelope;
        const inner = typeof envelope.payload === 'string' ? JSON.parse(envelope.payload) : envelope.payload;
        await handler(inner, envelope);
        this.channel!.ack(msg);
      } catch (err) {
        logger.error(`RabbitConsumer error procesando '${queueName}': ${(err as Error).message}`);
        this.channel!.nack(msg, false, false); // → DLQ, sin requeue
      }
    });
    logger.info(`RabbitConsumer escuchando cola '${queueName}'`);
  }

  async close(): Promise<void> {
    try { await this.channel?.close(); } catch { /* noop */ }
    try { await this.conn?.close(); } catch { /* noop */ }
  }
}
