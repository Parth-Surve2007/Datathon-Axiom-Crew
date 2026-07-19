import type { FindManyResult } from '@app-types/index';

// ─── Common Search/Filter Params ──────────────────────────────────────────────
export interface ListParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends ListParams {
  q?: string;
}

// ─── Base Repository Interface ────────────────────────────────────────────────
export interface IBaseRepository<TEntity, TCreateDto, TUpdateDto> {
  findById(id: string): Promise<TEntity | null>;
  findByIdIncludeDeleted(id: string): Promise<TEntity | null>;
  findMany(params: ListParams & { filters?: Record<string, unknown> }): Promise<FindManyResult<TEntity>>;
  create(dto: TCreateDto): Promise<TEntity>;
  update(id: string, dto: TUpdateDto): Promise<TEntity | null>;
  softDelete(id: string): Promise<boolean>;
  hardDelete(id: string): Promise<boolean>;
  restore(id: string): Promise<TEntity | null>;
  exists(id: string): Promise<boolean>;
  count(filters?: Record<string, unknown>): Promise<number>;
  bulkCreate(dtos: TCreateDto[]): Promise<TEntity[]>;
  bulkSoftDelete(ids: string[]): Promise<number>;
  search(params: {
    searchColumns: string[];
    query: string;
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, unknown>;
  }): Promise<FindManyResult<TEntity>>;
}

// ─── Domain Repository Interfaces ─────────────────────────────────────────────

// Kept for backward compatibility with existing factory
export interface IFirRepository extends IBaseRepository<any, any, any> {
  findByFirNumber(firNumber: string): Promise<any | null>;
  findFirsByStation(stationId: string, page: number, limit: number): Promise<FindManyResult<any>>;
  findByCrimeNumber(crimeNumber: string): Promise<any | null>;
}

export interface IPersonRepository extends IBaseRepository<any, any, any> {
  findByAadhar(aadharNumber: string): Promise<any | null>;
  searchByName(query: string, page: number, limit: number): Promise<FindManyResult<any>>;
}

export interface IPoliceStationRepository extends IBaseRepository<any, any, any> {
  findByCode(code: string): Promise<any | null>;
  findByDistrict(district: string, params: ListParams): Promise<FindManyResult<any>>;
}

export interface IOfficerRepository extends IBaseRepository<any, any, any> {
  findByBadgeId(badgeId: string): Promise<any | null>;
  findByStation(stationId: string, params: ListParams): Promise<FindManyResult<any>>;
}

export interface IUserRepository extends IBaseRepository<any, any, any> {
  findByEmail(email: string): Promise<any | null>;
  findByOfficerId(officerId: string): Promise<any | null>;
  updateLastLogin(id: string): Promise<void>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
}

export interface IRoleRepository extends IBaseRepository<any, any, any> {
  findByName(name: string): Promise<any | null>;
}

export interface IEvidenceRepository extends IBaseRepository<any, any, any> {
  findByFirId(firId: string, params: ListParams): Promise<FindManyResult<any>>;
}

export interface IVehicleRepository extends IBaseRepository<any, any, any> {
  findByRegistrationNumber(regNumber: string): Promise<any | null>;
}

export interface IPhoneRepository extends IBaseRepository<any, any, any> {
  findByPhoneNumber(phoneNumber: string): Promise<any | null>;
}

export interface IAddressRepository extends IBaseRepository<any, any, any> {}

export interface IOrganizationRepository extends IBaseRepository<any, any, any> {}

export interface IActRepository extends IBaseRepository<any, any, any> {
  findByName(name: string): Promise<any | null>;
}

export interface ISectionRepository extends IBaseRepository<any, any, any> {
  findByActId(actId: string, params: ListParams): Promise<FindManyResult<any>>;
  findByCode(actId: string, sectionCode: string): Promise<any | null>;
}

export interface ICrimeCategoryRepository extends IBaseRepository<any, any, any> {
  findByName(name: string): Promise<any | null>;
}

export interface ICrimeTypeRepository extends IBaseRepository<any, any, any> {
  findByCategoryId(categoryId: string, params: ListParams): Promise<FindManyResult<any>>;
}

export interface ICourtCaseRepository extends IBaseRepository<any, any, any> {
  findByFirId(firId: string, params: ListParams): Promise<FindManyResult<any>>;
  findByCaseNumber(caseNumber: string): Promise<any | null>;
}

export interface IChargesheetRepository extends IBaseRepository<any, any, any> {
  findByFirId(firId: string, params: ListParams): Promise<FindManyResult<any>>;
}

export interface IInvestigationTeamRepository extends IBaseRepository<any, any, any> {
  findByFirId(firId: string, params: ListParams): Promise<FindManyResult<any>>;
  addMember(teamId: string, officerId: string): Promise<void>;
  removeMember(teamId: string, officerId: string): Promise<void>;
  getMembers(teamId: string): Promise<any[]>;
}

export interface ITimelineEventRepository extends IBaseRepository<any, any, any> {
  findByFirId(firId: string, params: ListParams): Promise<FindManyResult<any>>;
}

export interface IDocumentRepository extends IBaseRepository<any, any, any> {
  findByFirId(firId: string, params: ListParams): Promise<FindManyResult<any>>;
}

export interface IAuditLogRepository {
  findByEntity(tableName: string, recordId: string, params: ListParams): Promise<FindManyResult<any>>;
  findByUser(userId: string, params: ListParams): Promise<FindManyResult<any>>;
  findMany(params: ListParams & { filters?: Record<string, unknown> }): Promise<FindManyResult<any>>;
}

// Legacy graph interface — kept for graph module
export interface IGraphRepository {
  getNodes(type?: string): Promise<any[]>;
  getEdges(sourceId?: string, targetId?: string): Promise<any[]>;
  addNode(node: any): Promise<void>;
  addEdge(edge: any): Promise<void>;
}
