import { firService } from '../fir.service';
import { repositoryFactory } from '../../repositories/factory';

// Mock the repository factory
jest.mock('../../repositories/factory', () => ({
  repositoryFactory: {
    getFirRepository: jest.fn(),
    getEvidenceRepository: jest.fn(),
    getChargesheetRepository: jest.fn(),
    getTimelineEventRepository: jest.fn()
  }
}));

describe('FirService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchFirs', () => {
    it('should search using the repository when query is provided', async () => {
      const mockSearch = jest.fn().mockResolvedValue({ data: [], total: 0 });
      (repositoryFactory.getFirRepository as jest.Mock).mockReturnValue({
        search: mockSearch
      });

      await firService.searchFirs({ query: 'theft', district: 'D1' });

      expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({
        query: 'theft',
        filters: expect.objectContaining({ district: 'D1' })
      }));
    });

    it('should use findMany when query is not provided', async () => {
      const mockFindMany = jest.fn().mockResolvedValue({ data: [], total: 0 });
      (repositoryFactory.getFirRepository as jest.Mock).mockReturnValue({
        findMany: mockFindMany
      });

      await firService.searchFirs({ district: 'D1' });

      expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({
        filters: expect.objectContaining({ district: 'D1' })
      }));
    });
  });

  describe('getCaseDetails', () => {
    it('should aggregate details from multiple repositories', async () => {
      const mockFir = { id: 'fir-1', fir_number: '123' };
      const mockEvidence = [{ id: 'ev-1' }];
      
      (repositoryFactory.getFirRepository as jest.Mock).mockReturnValue({
        findById: jest.fn().mockResolvedValue(mockFir)
      });
      (repositoryFactory.getEvidenceRepository as jest.Mock).mockReturnValue({
        findByFirId: jest.fn().mockResolvedValue({ data: mockEvidence })
      });
      (repositoryFactory.getChargesheetRepository as jest.Mock).mockReturnValue({
        findByFirId: jest.fn().mockResolvedValue({ data: [] })
      });
      (repositoryFactory.getTimelineEventRepository as jest.Mock).mockReturnValue({
        findByFirId: jest.fn().mockResolvedValue({ data: [] })
      });

      const details = await firService.getCaseDetails('fir-1');
      
      expect(details.fir).toEqual(mockFir);
      expect(details.evidence).toEqual(mockEvidence);
      expect(details.chargesheets).toEqual([]);
      expect(details.timeline).toEqual([]);
    });

    it('should throw NotFoundError if FIR not found by ID or Number', async () => {
      (repositoryFactory.getFirRepository as jest.Mock).mockReturnValue({
        findById: jest.fn().mockResolvedValue(null),
        findByFirNumber: jest.fn().mockResolvedValue(null)
      });

      await expect(firService.getCaseDetails('missing')).rejects.toThrow('Case with ID or FIR number missing not found.');
    });
  });
});
