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
import { authMock } from './interfaces/http/middleware/authMock';
import { sanitize } from './interfaces/http/middleware/sanitize';
import { swaggerSpec } from './interfaces/swagger/config';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.cors.origin }));
app.use(morgan('combined', {
  stream: { write: (message: string) => logger.info(message.trim()) },
}));
app.use(express.json({ limit: '10mb' }));
app.use(sanitize);
app.use(authMock);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Farmacia API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
}));

const container = createContainer();
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
