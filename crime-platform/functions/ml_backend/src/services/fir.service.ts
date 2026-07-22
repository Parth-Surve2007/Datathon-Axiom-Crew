import { BaseService } from './base.service';
import { repositoryFactory } from '../repositories/factory';
import { NotFoundError } from '../utils/errors';

export class FirService extends BaseService {
  constructor() {
    super('FirService');
  }

  /**
   * Search for FIRs based on various criteria.
   * Reusable domain logic.
   */
  async searchFirs(params: {
    query?: string;
    district?: string;
    station?: string;
    crimeType?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<any> {
    const firRepo = repositoryFactory.getFirRepository();
    
    const filters: Record<string, unknown> = {};
    if (params.district) filters.district = params.district;
    if (params.station) filters.station = params.station;
    if (params.crimeType) filters.crime_type = params.crimeType;
    if (params.status) filters.status = params.status;
    if (params.dateFrom || params.dateTo) {
      filters.dateRange = {
        from: params.dateFrom,
        to: params.dateTo
      };
    }

    if (params.query) {
      return await firRepo.search({
        searchColumns: ['fir_number', 'description', 'summary'],
        query: params.query,
        page: params.page || 1,
        limit: params.limit || 10,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        filters
      });
    }

    return await firRepo.findMany({
      page: params.page || 1,
      limit: params.limit || 10,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      filters
    });
  }

  /**
   * Retrieve detailed information for a specific case/FIR, including evidence, victims, accused, etc.
   */
  async getCaseDetails(caseId: string): Promise<any> {
    const firRepo = repositoryFactory.getFirRepository();
    const evidenceRepo = repositoryFactory.getEvidenceRepository();
    const chargesheetRepo = repositoryFactory.getChargesheetRepository();
    const timelineRepo = repositoryFactory.getTimelineEventRepository();

    const fir = await firRepo.findById(caseId);
    if (!fir) {
      // Try by FIR number just in case
      const firByNumber = await firRepo.findByFirNumber(caseId);
      if (!firByNumber) {
        throw new NotFoundError(`Case with ID or FIR number ${caseId} not found.`);
      }
      return this.aggregateCaseDetails(firByNumber.id, firByNumber, evidenceRepo, chargesheetRepo, timelineRepo);
    }

    return this.aggregateCaseDetails(caseId, fir, evidenceRepo, chargesheetRepo, timelineRepo);
  }

  private async aggregateCaseDetails(
    firId: string, 
    fir: any, 
    evidenceRepo: any, 
    chargesheetRepo: any, 
    timelineRepo: any
  ) {
    const [evidence, chargesheets, timeline] = await Promise.all([
      evidenceRepo.findByFirId(firId, { page: 1, limit: 100 }),
      chargesheetRepo.findByFirId(firId, { page: 1, limit: 100 }),
      timelineRepo.findByFirId(firId, { page: 1, limit: 100 })
    ]);

    return {
      fir,
      evidence: evidence.data,
      chargesheets: chargesheets.data,
      timeline: timeline.data,
      // Victims, accused, witnesses would be joined here through personRepo or similar relationship mappings
      status: fir.status || 'Unknown'
    };
  }
}

export const firService = new FirService();
