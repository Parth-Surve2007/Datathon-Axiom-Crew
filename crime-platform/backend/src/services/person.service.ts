import { BaseService } from './base.service';
import { repositoryFactory } from '../repositories/factory';
import { NotFoundError } from '../utils/errors';

export class PersonService extends BaseService {
  constructor() {
    super('PersonService');
  }

  /**
   * Find associates for a person based on shared FIRs, vehicles, phones, and addresses.
   */
  async findAssociates(personId: string): Promise<any> {
    const personRepo = repositoryFactory.getPersonRepository();
    // Assuming GraphRepository or relational traversal to find associates.
    // For now, simulate the resolution using the person repo.
    
    const person = await personRepo.findById(personId);
    if (!person) {
       // Search by name if id is a name string
       const persons = await personRepo.searchByName(personId, 1, 1);
       if (!persons || persons.data.length === 0) {
          throw new NotFoundError(`Person with ID or Name ${personId} not found.`);
       }
    }

    // In a real implementation, we would query bridging tables or Graph DB:
    // e.g. "Find all persons who appear as co-accused in the same FIR"
    
    return {
      associates: [
        { name: 'Example Associate', relationship: 'Co-accused', confidence: 0.85 }
      ],
      sharedFirs: ['FIR-2023-01'],
      sharedVehicles: [],
      sharedPhones: ['+91-9876543210'],
      sharedAddresses: [],
      relationshipStrength: 'High'
    };
  }
}

export const personService = new PersonService();
