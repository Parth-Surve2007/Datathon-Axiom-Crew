import { IRetriever, RetrievalQuery } from './IRetriever';
import { RetrievalResult } from '../types';

export class SearchRetriever implements IRetriever {
  readonly sourceName = 'General Search';

  async retrieve(query: RetrievalQuery): Promise<RetrievalResult[]> {
    // Stub: Integrate with Postgres text search or Catalyst Datastore
    return [];
  }
}
