import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { corsConfig, appConfig } from '@config/index';
import { requestId, requestLogger, defaultRateLimiter } from '@middleware/index';
import { globalErrorHandler, notFoundHandler } from '@middleware/errorHandler';
import rootRouter from '@routes/index';

/**
 * Creates and configures the Express application.
 * Separated from server.ts to allow clean testing.
 */
export const createApp = (): express.Application => {
  const app = express();

  // ── Security Headers ─────────────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: appConfig.isProd,
    crossOriginEmbedderPolicy: appConfig.isProd,
  }));

  // ── CORS ─────────────────────────────────────────────────────────────────
  app.use(cors(corsConfig));
  app.options('*', cors(corsConfig));

  // ── Body Parsing ─────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ── Response Compression ─────────────────────────────────────────────────
  app.use(compression());

  // ── Request Context ───────────────────────────────────────────────────────
  app.use(requestId);

  // ── HTTP Access Logging ───────────────────────────────────────────────────
  app.use(requestLogger);

  // ── Rate Limiting ─────────────────────────────────────────────────────────
  app.use(defaultRateLimiter);

  // ── Trust Proxy (for Catalyst / Cloud Run / Load Balancers) ─────────────
  app.set('trust proxy', 1);

  // ── Routes ────────────────────────────────────────────────────────────────
  app.use(rootRouter);

  // ── 404 Handler ───────────────────────────────────────────────────────────
  app.use(notFoundHandler);

  // ── Global Error Handler (MUST be last) ──────────────────────────────────
  app.use(globalErrorHandler);

  return app;
};
