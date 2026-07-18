import { createLogger } from '@config/logger';

const log = createLogger('BaseService');

/**
 * Abstract base service.
 * All domain services extend this.
 * Provides shared logger and a common interface for future DI patterns.
 */
export abstract class BaseService {
  protected readonly log: ReturnType<typeof createLogger>;

  constructor(moduleName: string) {
    this.log = createLogger(moduleName);
    log.debug({ service: moduleName }, 'Service initialised');
  }
}
