import { IRetriever, RetrievalQuery } from './IRetriever';
import { RetrievalResult } from '../types';

export class DocumentRetriever implements IRetriever {
  readonly sourceName = 'Document Store';

  async retrieve(query: RetrievalQuery): Promise<RetrievalResult[]> {
    // Stub: RAG from PDF reports, FIR narratives
    return [];
  }
}
