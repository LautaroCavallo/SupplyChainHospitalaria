import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { config } from './config';
import logger from './config/logger';
import { createContainer } from './infrastructure/container';
import { createRoutes } from './interfaces/http/routes';
import { errorHandler } from './interfaces/http/middleware/errorHandler';
import { createAuthMiddleware } from './interfaces/http/middleware/auth';
import { sanitize } from './interfaces/http/middleware/sanitize';
import { swaggerSpec } from './interfaces/swagger/config';

const app = express();

// Detrás del proxy de Railway/Vercel: confiar en X-Forwarded-Proto para que req.protocol
// sea 'https'. Necesario para que el callbackUrl que enviamos a Módulo 7 use https:// y su
// POST no se rompa por el redirect http→https (que convierte POST en GET → 404).
app.set('trust proxy', true);

app.use(helmet());
app.use(cors({ origin: config.cors.origin }));
app.use(morgan('combined', {
  stream: { write: (message: string) => logger.info(message.trim()) },
}));
app.use(express.json({ limit: '10mb' }));
app.use(sanitize);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Farmacia API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
}));

const container = createContainer();
app.use((req, _res, next) => {
  container.setCurrentAuthToken(req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined);
  next();
});
app.use(createAuthMiddleware(container.coreAuthService));
app.use('/api/v1', createRoutes(container));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`Farmacia API running on port ${config.port}`);
  logger.info(`Swagger docs: http://localhost:${config.port}/api/docs`);
});

export default app;
