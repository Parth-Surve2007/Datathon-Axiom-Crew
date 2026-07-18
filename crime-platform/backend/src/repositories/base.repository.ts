import { createLogger } from '@config/logger';
import type { FindManyResult } from '../types/index';

const log = createLogger('BaseRepository');

/**
 * Abstract base repository.
 * All repositories extend this class and inject their specific table/query logic.
 * When Catalyst Data Store / PostgreSQL is connected, replace the stub methods
 * with real pg-pool or Catalyst ZCQL queries.
 */
export abstract class BaseRepository<TEntity, TCreateDto, TUpdateDto> {
  protected readonly tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
    log.debug({ table: tableName }, 'Repository initialised');
  }

  abstract findById(id: string): Promise<TEntity | null>;
  abstract findMany(params: { page: number; limit: number }): Promise<FindManyResult<TEntity>>;
  abstract create(dto: TCreateDto): Promise<TEntity>;
  abstract update(id: string, dto: TUpdateDto): Promise<TEntity | null>;
  abstract delete(id: string): Promise<boolean>;
}
