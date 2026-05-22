import winston from 'winston';
import { config } from './index';

const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    config.isProduction
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, stack }) => {
            return `${timestamp} [${level}]: ${stack || message}`;
          }),
        ),
  ),
  transports: [new winston.transports.Console()],
  defaultMeta: { service: 'farmacia-insumos' },
});

export default logger;
