import { RetrievalResult } from '../types';

export interface RetrievalQuery {
  text: string;
  filters?: Record<string, any>;
  limit?: number;
  minScore?: number;
}

export interface IRetriever {
  /**
   * Identifies the domain or type of data this retriever handles.
   */
  readonly sourceName: string;

  /**
   * Retrieves relevant context based on the query.
   */
  retrieve(query: RetrievalQuery): Promise<RetrievalResult[]>;
}
