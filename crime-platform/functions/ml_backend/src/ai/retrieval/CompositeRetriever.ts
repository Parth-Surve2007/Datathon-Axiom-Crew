import { IRetriever, RetrievalQuery } from './IRetriever';
import { RetrievalResult } from '../types';

export class CompositeRetriever implements IRetriever {
  readonly sourceName = 'Composite Orchestrator';
  private retrievers: IRetriever[];

  constructor(retrievers: IRetriever[]) {
    this.retrievers = retrievers;
  }

  async retrieve(query: RetrievalQuery): Promise<RetrievalResult[]> {
    // Execute all registered retrievers concurrently
    const results = await Promise.all(
      this.retrievers.map((r) => r.retrieve(query).catch(() => [] as RetrievalResult[]))
    );

    // Flatten and optionally rerank/sort by score
    const flatResults = results.flat();
    return flatResults.sort((a, b) => b.score - a.score);
  }
}
