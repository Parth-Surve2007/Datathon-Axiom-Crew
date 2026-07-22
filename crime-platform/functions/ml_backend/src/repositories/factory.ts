import type {
  IFirRepository,
  IPersonRepository,
  IGraphRepository,
  IPoliceStationRepository,
  IOfficerRepository,
  IUserRepository,
  IRoleRepository,
  IEvidenceRepository,
  IVehicleRepository,
  IPhoneRepository,
  IAddressRepository,
  IOrganizationRepository,
  IActRepository,
  ISectionRepository,
  ICrimeCategoryRepository,
  ICrimeTypeRepository,
  ICourtCaseRepository,
  IChargesheetRepository,
  IInvestigationTeamRepository,
  ITimelineEventRepository,
  IDocumentRepository,
  IAuditLogRepository,
  IEmployeeRepository,
  IDistrictRepository,
} from './interfaces';

// ── Postgres Implementations ───────────────────────────────────────────────────
import { PostgresFirRepository } from './postgres/fir.repository';
import { PostgresPoliceStationRepository } from './postgres/police-station.repository';
import { PostgresOfficerRepository } from './postgres/officer.repository';
import { PostgresUserRepository } from './postgres/user.repository';
import { PostgresRoleRepository } from './postgres/role.repository';
import { PostgresPersonRepository } from './postgres/person.repository';
import { PostgresEvidenceRepository } from './postgres/evidence.repository';
import { PostgresVehicleRepository } from './postgres/vehicle.repository';
import { PostgresPhoneRepository } from './postgres/phone.repository';
import { PostgresAddressRepository } from './postgres/address.repository';
import { PostgresOrganizationRepository } from './postgres/organization.repository';
import { PostgresActRepository } from './postgres/act.repository';
import { PostgresSectionRepository } from './postgres/section.repository';
import { PostgresCrimeCategoryRepository } from './postgres/crime-category.repository';
import { PostgresCrimeTypeRepository } from './postgres/crime-type.repository';
import { PostgresCourtCaseRepository } from './postgres/court-case.repository';
import { PostgresChargesheetRepository } from './postgres/chargesheet.repository';
import { PostgresInvestigationTeamRepository } from './postgres/investigation-team.repository';
import { PostgresTimelineEventRepository } from './postgres/timeline-event.repository';
import { PostgresDocumentRepository } from './postgres/document.repository';
import { PostgresAuditLogRepository } from './postgres/audit-log.repository';
import { PostgresEmployeeRepository } from './postgres/employee.repository';
import { PostgresDistrictRepository } from './postgres/district.repository';

// ── Catalyst Implementations ───────────────────────────────────────────────────
import { CatalystFirRepository } from './catalyst/fir.repository';
import { CatalystPoliceStationRepository } from './catalyst/police-station.repository';
import { CatalystOfficerRepository } from './catalyst/officer.repository';
import { CatalystUserRepository } from './catalyst/user.repository';
import { CatalystRoleRepository } from './catalyst/role.repository';
import { CatalystPersonRepository } from './catalyst/person.repository';
import { CatalystEvidenceRepository } from './catalyst/evidence.repository';
import { CatalystVehicleRepository } from './catalyst/vehicle.repository';
import { CatalystPhoneRepository } from './catalyst/phone.repository';
import { CatalystAddressRepository } from './catalyst/address.repository';
import { CatalystOrganizationRepository } from './catalyst/organization.repository';
import { CatalystActRepository } from './catalyst/act.repository';
import { CatalystSectionRepository } from './catalyst/section.repository';
import { CatalystCrimeCategoryRepository } from './catalyst/crime-category.repository';
import { CatalystCrimeTypeRepository } from './catalyst/crime-type.repository';
import { CatalystCourtCaseRepository } from './catalyst/court-case.repository';
import { CatalystChargesheetRepository } from './catalyst/chargesheet.repository';
import { CatalystInvestigationTeamRepository } from './catalyst/investigation-team.repository';
import { CatalystTimelineEventRepository } from './catalyst/timeline-event.repository';
import { CatalystDocumentRepository } from './catalyst/document.repository';
import { CatalystEmployeeRepository } from './catalyst/employee.repository';
import { CatalystDistrictRepository } from './catalyst/district.repository';

import { createLogger } from '../config/logger';

const log = createLogger('RepositoryFactory');

/**
 * RepositoryFactory — resolves the correct repository implementation based on
 * `DB_PROVIDER` environment variable ('POSTGRES' | 'CATALYST').
 *
 * All instances are lazily created and then cached (singleton per provider).
 * Services should always depend on the interface, not the concrete class.
 */
export class RepositoryFactory {
  private readonly provider: string;

  // ── Cached instances ──────────────────────────────────────────────────────
  private _fir: IFirRepository | null = null;
  private _person: IPersonRepository | null = null;
  private _policeStation: IPoliceStationRepository | null = null;
  private _officer: IOfficerRepository | null = null;
  private _user: IUserRepository | null = null;
  private _role: IRoleRepository | null = null;
  private _evidence: IEvidenceRepository | null = null;
  private _vehicle: IVehicleRepository | null = null;
  private _phone: IPhoneRepository | null = null;
  private _address: IAddressRepository | null = null;
  private _organization: IOrganizationRepository | null = null;
  private _act: IActRepository | null = null;
  private _section: ISectionRepository | null = null;
  private _crimeCategory: ICrimeCategoryRepository | null = null;
  private _crimeType: ICrimeTypeRepository | null = null;
  private _courtCase: ICourtCaseRepository | null = null;
  private _chargesheet: IChargesheetRepository | null = null;
  private _investigationTeam: IInvestigationTeamRepository | null = null;
  private _timelineEvent: ITimelineEventRepository | null = null;
  private _document: IDocumentRepository | null = null;
  private _auditLog: IAuditLogRepository | null = null;
  private _employee: IEmployeeRepository | null = null;
  private _district: IDistrictRepository | null = null;
  private _graph: IGraphRepository | null = null;

  constructor() {
    this.provider = process.env.DB_PROVIDER || 'POSTGRES';
    log.info({ provider: this.provider }, 'Repository factory initialized');
  }

  private resolve<T>(cached: T | null, pg: () => T, catalyst: () => T): T {
    if (cached) return cached;
    if (this.provider === 'POSTGRES') return pg();
    if (this.provider === 'CATALYST') return catalyst();
    throw new Error(`Unknown DB_PROVIDER: ${this.provider}`);
  }

  getFirRepository(): IFirRepository {
    return (this._fir ??= this.resolve<IFirRepository>(
      null,
      () => new PostgresFirRepository() as IFirRepository,
      () => new CatalystFirRepository() as IFirRepository,
    ));
  }

  getPersonRepository(): IPersonRepository {
    return (this._person ??= this.resolve<IPersonRepository>(
      null,
      () => new PostgresPersonRepository() as IPersonRepository,
      () => new CatalystPersonRepository() as IPersonRepository,
    ));
  }

  getPoliceStationRepository(): IPoliceStationRepository {
    return (this._policeStation ??= this.resolve<IPoliceStationRepository>(
      null,
      () => new PostgresPoliceStationRepository() as IPoliceStationRepository,
      () => new CatalystPoliceStationRepository() as IPoliceStationRepository,
    ));
  }

  getEmployeeRepository(): IEmployeeRepository {
    return (this._employee ??= this.resolve<IEmployeeRepository>(
      null,
      () => new PostgresEmployeeRepository() as IEmployeeRepository,
      () => new CatalystEmployeeRepository() as IEmployeeRepository,
    ));
  }

  getDistrictRepository(): IDistrictRepository {
    return (this._district ??= this.resolve<IDistrictRepository>(
      null,
      () => new PostgresDistrictRepository() as IDistrictRepository,
      () => new CatalystDistrictRepository() as IDistrictRepository,
    ));
  }

  getOfficerRepository(): IOfficerRepository {
    return (this._officer ??= this.resolve<IOfficerRepository>(
      null,
      () => new PostgresOfficerRepository() as IOfficerRepository,
      () => new CatalystOfficerRepository() as IOfficerRepository,
    ));
  }

  getUserRepository(): IUserRepository {
    return (this._user ??= this.resolve<IUserRepository>(
      null,
      () => new PostgresUserRepository() as IUserRepository,
      () => new CatalystUserRepository() as IUserRepository,
    ));
  }

  getRoleRepository(): IRoleRepository {
    return (this._role ??= this.resolve<IRoleRepository>(
      null,
      () => new PostgresRoleRepository() as IRoleRepository,
      () => new CatalystRoleRepository() as IRoleRepository,
    ));
  }

  getEvidenceRepository(): IEvidenceRepository {
    return (this._evidence ??= this.resolve<IEvidenceRepository>(
      null,
      () => new PostgresEvidenceRepository() as IEvidenceRepository,
      () => new CatalystEvidenceRepository() as IEvidenceRepository,
    ));
  }

  getVehicleRepository(): IVehicleRepository {
    return (this._vehicle ??= this.resolve<IVehicleRepository>(
      null,
      () => new PostgresVehicleRepository() as IVehicleRepository,
      () => new CatalystVehicleRepository() as IVehicleRepository,
    ));
  }

  getPhoneRepository(): IPhoneRepository {
    return (this._phone ??= this.resolve<IPhoneRepository>(
      null,
      () => new PostgresPhoneRepository() as IPhoneRepository,
      () => new CatalystPhoneRepository() as IPhoneRepository,
    ));
  }

  getAddressRepository(): IAddressRepository {
    return (this._address ??= this.resolve<IAddressRepository>(
      null,
      () => new PostgresAddressRepository() as IAddressRepository,
      () => new CatalystAddressRepository() as IAddressRepository,
    ));
  }

  getOrganizationRepository(): IOrganizationRepository {
    return (this._organization ??= this.resolve<IOrganizationRepository>(
      null,
      () => new PostgresOrganizationRepository() as IOrganizationRepository,
      () => new CatalystOrganizationRepository() as IOrganizationRepository,
    ));
  }

  getActRepository(): IActRepository {
    return (this._act ??= this.resolve<IActRepository>(
      null,
      () => new PostgresActRepository() as IActRepository,
      () => new CatalystActRepository() as IActRepository,
    ));
  }

  getSectionRepository(): ISectionRepository {
    return (this._section ??= this.resolve<ISectionRepository>(
      null,
      () => new PostgresSectionRepository() as ISectionRepository,
      () => new CatalystSectionRepository() as ISectionRepository,
    ));
  }

  getCrimeCategoryRepository(): ICrimeCategoryRepository {
    return (this._crimeCategory ??= this.resolve<ICrimeCategoryRepository>(
      null,
      () => new PostgresCrimeCategoryRepository() as ICrimeCategoryRepository,
      () => new CatalystCrimeCategoryRepository() as ICrimeCategoryRepository,
    ));
  }

  getCrimeTypeRepository(): ICrimeTypeRepository {
    return (this._crimeType ??= this.resolve<ICrimeTypeRepository>(
      null,
      () => new PostgresCrimeTypeRepository() as ICrimeTypeRepository,
      () => new CatalystCrimeTypeRepository() as ICrimeTypeRepository,
    ));
  }

  getCourtCaseRepository(): ICourtCaseRepository {
    return (this._courtCase ??= this.resolve<ICourtCaseRepository>(
      null,
      () => new PostgresCourtCaseRepository() as ICourtCaseRepository,
      () => new CatalystCourtCaseRepository() as ICourtCaseRepository,
    ));
  }

  getChargesheetRepository(): IChargesheetRepository {
    return (this._chargesheet ??= this.resolve<IChargesheetRepository>(
      null,
      () => new PostgresChargesheetRepository() as IChargesheetRepository,
      () => new CatalystChargesheetRepository() as IChargesheetRepository,
    ));
  }

  getInvestigationTeamRepository(): IInvestigationTeamRepository {
    return (this._investigationTeam ??= this.resolve<IInvestigationTeamRepository>(
      null,
      () => new PostgresInvestigationTeamRepository() as IInvestigationTeamRepository,
      () => new CatalystInvestigationTeamRepository() as IInvestigationTeamRepository,
    ));
  }

  getTimelineEventRepository(): ITimelineEventRepository {
    return (this._timelineEvent ??= this.resolve<ITimelineEventRepository>(
      null,
      () => new PostgresTimelineEventRepository() as ITimelineEventRepository,
      () => new CatalystTimelineEventRepository() as ITimelineEventRepository,
    ));
  }

  getDocumentRepository(): IDocumentRepository {
    return (this._document ??= this.resolve<IDocumentRepository>(
      null,
      () => new PostgresDocumentRepository() as IDocumentRepository,
      () => new CatalystDocumentRepository() as IDocumentRepository,
    ));
  }

  getAuditLogRepository(): IAuditLogRepository {
    // Audit logs always use Postgres regardless of provider
    return (this._auditLog ??= new PostgresAuditLogRepository());
  }

  getGraphRepository(): IGraphRepository {
    if (!this._graph) {
      throw new Error('GraphRepository not implemented in this phase');
    }
    return this._graph;
  }
}

/** Singleton factory used throughout the application */
export const repositoryFactory = new RepositoryFactory();
