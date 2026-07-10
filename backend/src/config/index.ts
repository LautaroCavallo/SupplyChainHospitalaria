import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  cors: {
    origin: (process.env.CORS_ORIGIN || '*').includes(',')
      ? (process.env.CORS_ORIGIN || '').split(',').map((origin) => origin.trim()).filter(Boolean)
      : process.env.CORS_ORIGIN || '*',
  },
  logLevel: process.env.LOG_LEVEL || 'info',
  integrations: {
    coreApiUrl: process.env.CORE_API_URL || '',
    hceApiUrl: process.env.HCE_API_URL || '',
    externalTimeoutMs: parseInt(process.env.EXTERNAL_TIMEOUT_MS || '8000', 10),
    authMode: process.env.AUTH_MODE || 'mock',
    recetaMode: process.env.RECETA_MODE || 'mock',
    comprasApiUrl: process.env.COMPRAS_URL || '',
    comprasUseMock: process.env.COMPRAS_USE_MOCK !== 'false',
  },
  kafka: {
    // Si está deshabilitado, la API arranca igual pero el envío a Compras falla al publicar.
    enabled: process.env.KAFKA_ENABLED !== 'false',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',').map((b) => b.trim()).filter(Boolean),
    clientId: process.env.KAFKA_CLIENT_ID || 'farmacia-insumos',
    consumerGroup: process.env.KAFKA_CONSUMER_GROUP || 'compras-worker',
    topics: {
      ordenSolicitada: process.env.KAFKA_TOPIC_ORDEN || 'compras.orden-solicitada',
      // Dead Letter Topic: eventos que agotaron los reintentos.
      ordenSolicitadaDLT: `${process.env.KAFKA_TOPIC_ORDEN || 'compras.orden-solicitada'}.DLT`,
    },
    maxReintentos: parseInt(process.env.KAFKA_MAX_REINTENTOS || '3', 10),
  },
};
