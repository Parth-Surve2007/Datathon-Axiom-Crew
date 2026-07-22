import 'dotenv/config';
import { z } from 'zod';

// ─── Environment Schema ────────────────────────────────────────────────────────
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  API_VERSION: z.string().default('v1'),
  APP_NAME: z.string().default('KrimeAI Backend'),
  DB_PROVIDER: z.enum(['POSTGRES', 'CATALYST']).default('POSTGRES'),

  // Security
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  // Zoho Catalyst
  CATALYST_PROJECT_ID: z.string().optional(),
  CATALYST_CLIENT_ID: z.string().optional(),
  CATALYST_CLIENT_SECRET: z.string().optional(),
  CATALYST_REDIRECT_URL: z.string().optional(),
  CATALYST_ORG_ID: z.string().optional(),
  CATALYST_QUICKML_ENDPOINT_URL: z.string().url().optional(),
  CATALYST_QUICKML_DEPLOYMENT_URL: z.string().url().optional(),
  CATALYST_QUICKML_ENDPOINT_KEY: z.string().optional(),
  CATALYST_MODEL_ID: z.string().optional(),
  CATALYST_TOP_K: z.coerce.number().optional(),
  CATALYST_OAUTH_SETUP_SECRET: z.string().optional(),
  CATALYST_REFRESH_TOKEN: z.string().optional(),
  ZOHO_REFRESH_TOKEN: z.string().optional(),
  ZOHO_ACCOUNTS_URL: z.string().url().default('https://accounts.zoho.in'),
  CATALYST_ENVIRONMENT: z.enum(['development', 'production']).default('development'),

  // Catalyst Database
  CATALYST_DB_HOST: z.string().optional(),
  CATALYST_DB_PORT: z.coerce.number().default(5432),
  CATALYST_DB_NAME: z.string().default('crime_intelligence'),
  CATALYST_DB_USER: z.string().optional(),
  CATALYST_DB_PASSWORD: z.string().optional(),
  CATALYST_DB_SSL: z.coerce.boolean().default(true),
  CATALYST_DB_POOL_MIN: z.coerce.number().default(2),
  CATALYST_DB_POOL_MAX: z.coerce.number().default(10),
  CATALYST_DB_POOL_IDLE_TIMEOUT: z.coerce.number().default(30000),

  // AI / LLM
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-1.5-pro-latest'),
  OPENAI_API_KEY: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  LOG_FORMAT: z.enum(['pretty', 'json']).default('pretty'),
});

// ─── Validation ────────────────────────────────────────────────────────────────
const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  console.error('❌  Invalid environment configuration:');
  console.error(_parsed.error.format());
  process.exit(1);
}

export const env = _parsed.data;

// ─── Derived Config Objects ────────────────────────────────────────────────────
export const appConfig = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  apiVersion: env.API_VERSION,
  appName: env.APP_NAME,
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',
} as const;

export const authConfig = {
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
} as const;

export const corsConfig = {
  origin: env.CORS_ORIGIN.split(',').map(o => o.trim()),
  credentials: true as const,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as string[],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'] as string[],
};

export const rateLimitConfig = {
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
} as const;

export const catalystConfig = {
  projectId: env.CATALYST_PROJECT_ID,
  clientId: env.CATALYST_CLIENT_ID,
  clientSecret: env.CATALYST_CLIENT_SECRET,
  redirectUrl: env.CATALYST_REDIRECT_URL,
  orgId: env.CATALYST_ORG_ID,
  quickMlEndpointUrl: env.CATALYST_QUICKML_ENDPOINT_URL || env.CATALYST_QUICKML_DEPLOYMENT_URL,
  quickMlEndpointKey: env.CATALYST_QUICKML_ENDPOINT_KEY,
  refreshToken: env.ZOHO_REFRESH_TOKEN || env.CATALYST_REFRESH_TOKEN,
  accountsUrl: env.ZOHO_ACCOUNTS_URL,
  environment: env.CATALYST_ENVIRONMENT,
} as const;

export const dbConfig = {
  host: env.CATALYST_DB_HOST,
  port: env.CATALYST_DB_PORT,
  database: env.CATALYST_DB_NAME,
  user: env.CATALYST_DB_USER,
  password: env.CATALYST_DB_PASSWORD,
  ssl: env.CATALYST_DB_SSL,
  pool: {
    min: env.CATALYST_DB_POOL_MIN,
    max: env.CATALYST_DB_POOL_MAX,
    idleTimeoutMillis: env.CATALYST_DB_POOL_IDLE_TIMEOUT,
  },
} as const;

export const aiConfig = {
  geminiApiKey: env.GEMINI_API_KEY,
  geminiModel: env.GEMINI_MODEL,
  openaiApiKey: env.OPENAI_API_KEY,
} as const;

export const logConfig = {
  level: env.LOG_LEVEL,
  format: env.LOG_FORMAT,
} as const;
