import { Producer } from 'kafkajs';
import { IEventPublisher } from '../../domain/services/IEventPublisher';
import { getKafka } from './KafkaClient';
import logger from '../../config/logger';

/**
 * Implementación de IEventPublisher sobre Kafka.
 * Conexión perezosa: el producer se conecta en el primer publish, así la API
 * arranca aunque Kafka todavía no esté disponible.
 */
export class KafkaEventPublisher implements IEventPublisher {
  private producer: Producer | null = null;
  private connecting: Promise<void> | null = null;

  private async ensureConnected(): Promise<Producer> {
    if (this.producer) return this.producer;
    if (!this.connecting) {
      const producer = getKafka().producer({ allowAutoTopicCreation: true });
      this.connecting = producer.connect().then(() => {
        this.producer = producer;
        logger.info('KafkaEventPublisher conectado');
      });
    }
    await this.connecting;
    return this.producer!;
  }

  async publish(topic: string, key: string, payload: unknown): Promise<void> {
    const producer = await this.ensureConnected();
    await producer.send({
      topic,
      messages: [{ key, value: JSON.stringify(payload) }],
    });
    logger.info(`Evento publicado en '${topic}' (key=${key})`);
  }

  async disconnect(): Promise<void> {
    if (this.producer) await this.producer.disconnect();
    this.producer = null;
    this.connecting = null;
  }
}
