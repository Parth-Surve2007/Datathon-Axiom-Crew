import 'dotenv/config';
import { createApp } from './app';
import { appConfig } from '@config/index';
import { logger } from '@config/logger';

const app = createApp();
let server: ReturnType<typeof app.listen>;

const start = (): void => {
  server = app.listen(appConfig.port, () => {
    logger.info(
      {
        module: 'Server',
        port: appConfig.port,
        env: appConfig.nodeEnv,
        api: `/api/${appConfig.apiVersion}`,
      },
      `🚀 ${appConfig.appName} running on port ${appConfig.port}`,
    );
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      logger.fatal({ module: 'Server' }, `Port ${appConfig.port} is already in use.`);
    } else {
      logger.fatal({ err, module: 'Server' }, 'Server startup error');
    }
    process.exit(1);
  });
};

// ── Graceful Shutdown ──────────────────────────────────────────────────────────
const shutdown = (signal: string): void => {
  logger.warn({ module: 'Server' }, `${signal} received. Initiating graceful shutdown...`);

  server.close(err => {
    if (err) {
      logger.error({ err, module: 'Server' }, 'Error during shutdown');
      process.exit(1);
    }
    logger.info({ module: 'Server' }, 'Server closed cleanly. Goodbye.');
    process.exit(0);
  });

  // Force exit if graceful shutdown takes longer than 10s
  setTimeout(() => {
    logger.error({ module: 'Server' }, 'Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  logger.fatal({ reason, module: 'Process' }, 'Unhandled promise rejection');
  process.exit(1);
});

process.on('uncaughtException', (err: Error) => {
  logger.fatal({ err, module: 'Process' }, 'Uncaught exception');
  process.exit(1);
});

start();
