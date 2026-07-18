import pino from 'pino';
import { logConfig, appConfig } from './index';

const transport =
  logConfig.format === 'pretty'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
          messageFormat: '[{module}] {msg}',
        },
      }
    : undefined;

export const logger = pino(
  {
    name: appConfig.appName,
    level: logConfig.level,
    redact: {
      paths: ['req.headers.authorization', '*.password', '*.jwt', '*.token'],
      censor: '[REDACTED]',
    },
    serializers: {
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
      err: pino.stdSerializers.err,
    },
    base: {
      service: 'krime-ai-backend',
      env: appConfig.nodeEnv,
    },
  },
  transport ? pino.transport(transport) : undefined,
);

/**
 * Create a child logger with a module context label.
 * Usage: const log = createLogger('ChatService');
 */
export const createLogger = (module: string): pino.Logger =>
  logger.child({ module });
