import { StationService } from '../../services/station.service';
import { repositoryFactory } from '../../repositories/factory';

// Mock repository factory
jest.mock('../../repositories/factory', () => ({
  repositoryFactory: {
    getPoliceStationRepository: jest.fn().mockReturnValue({
      findById: jest.fn(),
      findMany: jest.fn(),
      search: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      findByCode: jest.fn(),
    })
  }
}));

describe('StationService', () => {
  let service: StationService;
  let mockRepo: any;

  beforeEach(() => {
    service = new StationService();
    mockRepo = repositoryFactory.getPoliceStationRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should return station if found', async () => {
      const mockStation = { id: '1', name: 'Central Station' };
      mockRepo.findById.mockResolvedValue(mockStation);

      const result = await service.getById('1');
      expect(result).toEqual(mockStation);
      expect(mockRepo.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundError if not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.getById('999')).rejects.toThrow('Police Station not found');
    });
  });

  describe('create', () => {
    it('should create a new station successfully', async () => {
      const dto = {
        name: 'North Station',
        code: 'NS01',
        district: 'North District',
        jurisdiction: 'North Zone',
      };
      mockRepo.findByCode.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue({ id: '2', ...dto });

      const result = await service.create(dto, 'admin-id');
      expect(result).toHaveProperty('id', '2');
      expect(mockRepo.create).toHaveBeenCalled();
    });

    it('should throw ConflictError if code exists', async () => {
      const dto = {
        name: 'North Station',
        code: 'NS01',
        district: 'North District',
        jurisdiction: 'North Zone',
      };
      mockRepo.findByCode.mockResolvedValue({ id: '3' });

      await expect(service.create(dto, 'admin-id')).rejects.toThrow('Station code already in use');
    });
  });
});
