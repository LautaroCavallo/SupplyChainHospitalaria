import { Kafka, logLevel } from 'kafkajs';
import { config } from '../../config';

/**
 * Cliente Kafka compartido por el publisher (API) y el consumer (worker).
 * Un solo broker en desarrollo; en producción se apunta a varios vía KAFKA_BROKERS.
 */
let kafka: Kafka | null = null;

export function getKafka(): Kafka {
  if (!kafka) {
    kafka = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
      logLevel: logLevel.ERROR,
      retry: { retries: 8 },
    });
  }
  return kafka;
}
