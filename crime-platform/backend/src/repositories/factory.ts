import type { IFirRepository, IPersonRepository, IGraphRepository } from './interfaces';
import { PostgresFirRepository } from './postgres/fir.repository';
import { CatalystFirRepository } from './catalyst/fir.repository';
import { createLogger } from '../config/logger';

const log = createLogger('RepositoryFactory');

export class RepositoryFactory {
  private provider: string;

  // Caching instances
  private firRepository: IFirRepository | null = null;
  private personRepository: IPersonRepository | null = null;
  private graphRepository: IGraphRepository | null = null;

  constructor() {
    this.provider = process.env.DB_PROVIDER || 'POSTGRES';
    log.info({ provider: this.provider }, 'Repository factory initialized');
  }

  getFirRepository(): IFirRepository {
    if (this.firRepository) return this.firRepository;

    if (this.provider === 'POSTGRES') {
      this.firRepository = new PostgresFirRepository();
    } else if (this.provider === 'CATALYST') {
      this.firRepository = new CatalystFirRepository();
    } else {
      throw new Error(`Unknown DB_PROVIDER: ${this.provider}`);
    }

    return this.firRepository;
  }

  getPersonRepository(): IPersonRepository {
    if (this.personRepository) return this.personRepository;

    // We would have similar implementations for Person
    if (this.provider === 'POSTGRES') {
      // this.personRepository = new PostgresPersonRepository();
      throw new Error('PostgresPersonRepository not fully implemented in this phase');
    } else if (this.provider === 'CATALYST') {
      // this.personRepository = new CatalystPersonRepository();
      throw new Error('CatalystPersonRepository not fully implemented in this phase');
    } else {
      throw new Error(`Unknown DB_PROVIDER: ${this.provider}`);
    }
  }

  getGraphRepository(): IGraphRepository {
    if (this.graphRepository) return this.graphRepository;

    // We would have similar implementations for Graph
    if (this.provider === 'POSTGRES') {
      // this.graphRepository = new PostgresGraphRepository();
      throw new Error('PostgresGraphRepository not fully implemented in this phase');
    } else if (this.provider === 'CATALYST') {
      // this.graphRepository = new CatalystGraphRepository();
      throw new Error('CatalystGraphRepository not fully implemented in this phase');
    } else {
      throw new Error(`Unknown DB_PROVIDER: ${this.provider}`);
    }
  }
}

// Export a singleton instance for use throughout the application
export const repositoryFactory = new RepositoryFactory();
