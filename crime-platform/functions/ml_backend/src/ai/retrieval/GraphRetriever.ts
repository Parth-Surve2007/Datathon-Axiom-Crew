import { IRetriever, RetrievalQuery } from './IRetriever';
import { RetrievalResult } from '../types';

export class GraphRetriever implements IRetriever {
  readonly sourceName = 'Syndicate Graph';

  async retrieve(query: RetrievalQuery): Promise<RetrievalResult[]> {
    // Stub: Query neo4j or cytoscape graph structure
    return [];
  }
}
