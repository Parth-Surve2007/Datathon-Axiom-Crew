import { DistrictService } from '../../services/district.service';
import { repositoryFactory } from '../../repositories/factory';

// Mock repository factory
jest.mock('../../repositories/factory', () => ({
  repositoryFactory: {
    getDistrictRepository: jest.fn().mockReturnValue({
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

describe('DistrictService', () => {
  let service: DistrictService;
  let mockRepo: any;

  beforeEach(() => {
    service = new DistrictService();
    mockRepo = repositoryFactory.getDistrictRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should return district if found', async () => {
      const mockDistrict = { id: '1', name: 'South District' };
      mockRepo.findById.mockResolvedValue(mockDistrict);

      const result = await service.getById('1');
      expect(result).toEqual(mockDistrict);
      expect(mockRepo.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundError if not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.getById('999')).rejects.toThrow('District not found');
    });
  });

  describe('create', () => {
    it('should create a new district successfully', async () => {
      const dto = {
        name: 'West District',
        code: 'WD01',
        stateId: 'S1',
      };
      mockRepo.findByCode.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue({ id: '2', ...dto });

      const result = await service.create(dto, 'admin-id');
      expect(result).toHaveProperty('id', '2');
      expect(mockRepo.create).toHaveBeenCalled();
    });

    it('should throw ConflictError if code exists', async () => {
      const dto = {
        name: 'West District',
        code: 'WD01',
        stateId: 'S1',
      };
      mockRepo.findByCode.mockResolvedValue({ id: '3' });

      await expect(service.create(dto, 'admin-id')).rejects.toThrow('District code already in use');
    });
  });
});
