import dotenv from 'dotenv';
dotenv.config();

import { getKafka } from './infrastructure/messaging/KafkaClient';
import { createContainer } from './infrastructure/container';
import { config } from './config';
import logger from './config/logger';
import { OrdenCompraPayload } from './domain/services/IComprasService';

/**
 * WORKER — consumer de la arquitectura orientada a eventos.
 *
 * Consume el topic 'compras.orden-solicitada' y hace el envío REAL al módulo de
 * Compras (fixture o HTTP). Propiedades clave para la evaluación:
 *
 *  - Proceso SEPARADO de la API: se lo puede matar sin bajar la API ni Kafka.
 *  - La cola vive en Kafka (durable): los eventos encolados sobreviven al reinicio.
 *  - Commit de offset SOLO tras procesar OK (autoCommit de kafkajs tras eachMessage):
 *    si el worker muere a mitad, el evento se re-entrega y se reprocesa.
 *  - Idempotencia: si la solicitud ya fue enviada (ordenCompraExternaId presente),
 *    se saltea para no duplicar la orden ante una re-entrega.
 *  - Reintentos con backoff + Dead Letter Topic (.DLT) para mensajes "venenosos".
 */
async function main() {
  const container = createContainer();
  const comprasService = container.comprasService;
  const solicitudRepo = container.solicitudCompraRepository;
  const confirmarAdjudicacion = container.confirmarAdjudicacion;
  const publisher = container.eventPublisher;

  const kafka = getKafka();
  const consumer = kafka.consumer({ groupId: config.kafka.consumerGroup });

  await consumer.connect();
  await consumer.subscribe({ topic: config.kafka.topics.ordenSolicitada, fromBeginning: true });

  logger.info(`Worker escuchando topic '${config.kafka.topics.ordenSolicitada}' (group=${config.kafka.consumerGroup})`);

  await consumer.run({
    eachMessage: async ({ message }) => {
      const raw = message.value?.toString();
      if (!raw) return;

      let payload: OrdenCompraPayload;
      try {
        payload = JSON.parse(raw);
      } catch {
        logger.error('Mensaje ilegible, se envía a DLT');
        await publisher.publish(config.kafka.topics.ordenSolicitadaDLT, 'parse-error', { raw });
        return; // commitea: no reintenta un mensaje que nunca va a parsear
      }

      const solicitudId = payload.solicitudCompraId;

      // Idempotencia: si ya fue enviada a Compras, no reprocesar (Kafka es at-least-once).
      const actual = await solicitudRepo.findById(solicitudId);
      if (!actual) {
        logger.warn(`Solicitud ${solicitudId} no existe; se descarta el evento`);
        return;
      }
      if ((actual as any).ordenCompraExternaId) {
        logger.info(`Solicitud ${solicitudId} ya procesada (idempotente); se saltea`);
        return;
      }

      // Reintentos con backoff antes de dar por perdido el mensaje.
      let ultimoError: unknown;
      for (let intento = 1; intento <= config.kafka.maxReintentos; intento++) {
        try {
          await procesar(payload, comprasService, solicitudRepo, confirmarAdjudicacion);
          logger.info(`Orden ${payload.ordenCompraId} procesada (solicitud ${solicitudId})`);
          return; // OK → se commitea el offset
        } catch (err) {
          ultimoError = err;
          logger.warn(`Intento ${intento}/${config.kafka.maxReintentos} falló para ${solicitudId}: ${(err as Error).message}`);
          await sleep(500 * intento);
        }
      }

      // Agotó reintentos → DLT (no bloquea la partición) y se commitea.
      logger.error(`Orden ${payload.ordenCompraId} a DLT tras ${config.kafka.maxReintentos} intentos`);
      await publisher.publish(config.kafka.topics.ordenSolicitadaDLT, solicitudId, {
        payload,
        error: (ultimoError as Error)?.message,
      });
    },
  });

  // Cierre ordenado: al recibir la señal de "tirar el proceso".
  const shutdown = async () => {
    logger.info('Worker cerrando...');
    try { await consumer.disconnect(); } catch { /* noop */ }
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

/**
 * Envío real a Compras + aplicación de la adjudicación (si el módulo autoresponde).
 */
async function procesar(
  payload: OrdenCompraPayload,
  comprasService: ReturnType<typeof createContainer>['comprasService'],
  solicitudRepo: ReturnType<typeof createContainer>['solicitudCompraRepository'],
  confirmarAdjudicacion: ReturnType<typeof createContainer>['confirmarAdjudicacion'],
): Promise<void> {
  const resultado = await comprasService.enviarOrdenCompra(payload);

  if (!resultado.exitoso) {
    throw new Error(`Compras rechazó el envío: ${resultado.errores.join(', ')}`);
  }

  // Marca que ya se envió (clave de idempotencia).
  await solicitudRepo.update(payload.solicitudCompraId, {
    ordenCompraExternaId: resultado.ordenCompraExternaId,
  });

  // Si el módulo autoresponde la adjudicación (fixture/mock), aplicarla ya.
  // Con el módulo real, la adjudicación llega luego por el callback HTTP.
  if (resultado.autoCallback) {
    await confirmarAdjudicacion.execute(payload.solicitudCompraId, resultado.autoCallback as any);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((err) => {
  logger.error(`Worker fatal: ${(err as Error).message}`);
  process.exit(1);
});
