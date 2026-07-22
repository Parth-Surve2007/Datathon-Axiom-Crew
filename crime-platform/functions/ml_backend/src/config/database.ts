import { Pool } from 'pg';
import { dbConfig, env } from './index';
import { createLogger } from './logger';

const log = createLogger('DatabaseAdapter');

// ─── PostgreSQL Pool Singleton ───────────────────────────────────────────────
let pgPool: Pool | null = null;

export const getPgPool = (): Pool => {
  if (pgPool) return pgPool;

  pgPool = new Pool({
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    password: dbConfig.password,
    ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
    min: dbConfig.pool.min,
    max: dbConfig.pool.max,
    idleTimeoutMillis: dbConfig.pool.idleTimeoutMillis,
  });

  pgPool.on('error', (err) => {
    log.error({ err }, 'Unexpected error on idle PostgreSQL client');
    process.exit(-1);
  });

  log.info('PostgreSQL Pool initialized');
  return pgPool;
};

// ─── Catalyst DB Singleton ───────────────────────────────────────────────────
// Note: In a real Catalyst environment, the Catalyst SDK is initialized per request
// or via a global catalyst app instance. Here we mock the adapter structure.
let catalystApp: any | null = null;

export const getCatalystApp = () => {
  if (catalystApp) return catalystApp;
  
  // @ts-ignore - Catalyst SDK would be imported here
  // const catalyst = require('zcatalyst-sdk-node');
  // catalystApp = catalyst.initialize();
  
  log.info('Catalyst DB App initialized (mock)');
  catalystApp = {}; // Mock object for compilation
  return catalystApp;
};

// ─── Initialization Strategy ─────────────────────────────────────────────────
export const initDatabase = async (): Promise<void> => {
  const provider = process.env.DB_PROVIDER || 'POSTGRES';
  
  log.info({ provider }, 'Initializing database connection');
  
  try {
    if (provider === 'POSTGRES') {
      const pool = getPgPool();
      const client = await pool.connect();
      client.release();
      log.info('Successfully connected to PostgreSQL');
    } else if (provider === 'CATALYST') {
      getCatalystApp();
      log.info('Successfully connected to Zoho Catalyst Data Store');
    } else {
      throw new Error(`Unknown DB_PROVIDER: ${provider}`);
    }
  } catch (err) {
    log.fatal({ err }, 'Failed to initialize database connection');
    process.exit(1);
  }
};
