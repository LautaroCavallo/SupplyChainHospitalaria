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
  jwtSecret: process.env.JWT_SECRET || 'healthgrid-dev-secret-2024',
  integrations: {
    coreApiUrl: process.env.CORE_API_URL || '',
    // JWKS de Core para verificar la firma de los JWT localmente (RS256), sin llamar a Core por request.
    coreJwksUrl: process.env.CORE_JWKS_URL || (process.env.CORE_API_URL ? `${process.env.CORE_API_URL.replace(/\/$/, '')}/.well-known/jwks.json` : ''),
    // Credenciales de servicio de Farmacia para autenticarse en Core (publicar eventos, configurar colas).
    coreServiceEmail: process.env.CORE_SERVICE_EMAIL || 'admin@admin.com',
    coreServicePassword: process.env.CORE_SERVICE_PASSWORD || '123123',
    // Nombre de este módulo como publicador en el bus de eventos de Core.
    publisherModule: process.env.PUBLISHER_MODULE || 'farmacia',
    hceApiUrl: process.env.HCE_API_URL || '',
    externalTimeoutMs: parseInt(process.env.EXTERNAL_TIMEOUT_MS || '8000', 10),
    authMode: process.env.AUTH_MODE || 'mock',
    recetaMode: process.env.RECETA_MODE || 'mock',
    // Base del Módulo 7 vía API Gateway de Core (el Gateway agrega la API key de Facturación).
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
  // RabbitMQ del sistema Health Grid (para ESCUCHAR nuestras colas; publicar es vía Core).
  rabbit: {
    url: (() => {
      if (process.env.RABBITMQ_URL) return process.env.RABBITMQ_URL;
      const host = process.env.RABBITMQ_HOST;
      if (!host) return '';
      // El '@' del usuario (suele ser un email) debe ir escapado como %40.
      const user = encodeURIComponent(process.env.RABBITMQ_USER || '');
      const pass = encodeURIComponent(process.env.RABBITMQ_PASSWORD || '');
      const port = process.env.RABBITMQ_PORT || '5672';
      const rawVhost = process.env.RABBITMQ_VHOST || '';
      const vhost = rawVhost && rawVhost !== '/' ? encodeURIComponent(rawVhost) : '';
      const auth = user ? `${user}:${pass}@` : '';
      return `amqp://${auth}${host}:${port}/${vhost}`;
    })(),
    prefetch: parseInt(process.env.RABBITMQ_PREFETCH || '10', 10),
    requestsQueue: process.env.RABBITMQ_REQUESTS_QUEUE || `${process.env.PUBLISHER_MODULE || 'farmacia'}.requests`,
    responsesQueue: process.env.RABBITMQ_RESPONSES_QUEUE || `${process.env.PUBLISHER_MODULE || 'farmacia'}.responses`,
  },
};
