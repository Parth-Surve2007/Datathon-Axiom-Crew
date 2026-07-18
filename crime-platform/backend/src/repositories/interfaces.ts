import type { FindManyResult } from '../types/index';

// ─── Base Repository Interface ────────────────────────────────────────────────
export interface IBaseRepository<TEntity, TCreateDto, TUpdateDto> {
  findById(id: string): Promise<TEntity | null>;
  findMany(params: { page: number; limit: number }): Promise<FindManyResult<TEntity>>;
  create(dto: TCreateDto): Promise<TEntity>;
  update(id: string, dto: TUpdateDto): Promise<TEntity | null>;
  delete(id: string): Promise<boolean>;
}

// ─── Domain Specific Interfaces ───────────────────────────────────────────────

export interface IFirRepository extends IBaseRepository<any, any, any> {
  findByFirNumber(firNumber: string): Promise<any | null>;
  findFirsByStation(stationId: string, page: number, limit: number): Promise<FindManyResult<any>>;
}

export interface IPersonRepository extends IBaseRepository<any, any, any> {
  findByAadhar(aadharNumber: string): Promise<any | null>;
  searchByName(query: string, page: number, limit: number): Promise<FindManyResult<any>>;
}

export interface IGraphRepository {
  getNodes(type?: string): Promise<any[]>;
  getEdges(sourceId?: string, targetId?: string): Promise<any[]>;
  addNode(node: any): Promise<void>;
  addEdge(edge: any): Promise<void>;
}
