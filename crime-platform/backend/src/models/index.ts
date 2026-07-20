/**
 * Models (Entities) — Type definitions matching the Catalyst Data Store schema.
 *
 * These are TypeScript interfaces only — not ORMs.
 * The actual table DDL will be in ../../../db/migrations/.
 *
 * Phase 2: Add FIR, Suspect, Victim, Station, User, Location models.
 */

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  email: string;
  badgeId: string;
  name: string;
  role: string;
  stationId: string;
  isActive: boolean;
  lastLogin?: Date;
}

export interface Station extends BaseEntity {
  name: string;
  code: string;
  district: string;
  jurisdiction: string;
  latitude?: number;
  longitude?: number;
}

// Phase 5 entities:
export interface Employee extends BaseEntity {
  badgeId: string;
  name: string;
  email: string;
  phone?: string;
  rankId: string;
  designationId?: string;
  stationId?: string;
  unitId?: string;
  isActive: boolean;
  joinDate?: Date;
}

export interface Unit extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  stationId?: string;
}

export interface District extends BaseEntity {
  name: string;
  code: string;
  stateId: string;
}

export interface State extends BaseEntity {
  name: string;
  code: string;
}

export interface Rank extends BaseEntity {
  name: string;
  level: number;
}

export interface Designation extends BaseEntity {
  name: string;
  description?: string;
}
