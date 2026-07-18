/**
 * Models (Entities) — Type definitions matching the Catalyst Data Store schema.
 *
 * These are TypeScript interfaces only — not ORMs.
 * The actual table DDL will be in /database/migrations/.
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

// Placeholder for Phase 2 entities:
// export interface FIR extends BaseEntity { ... }
// export interface Suspect extends BaseEntity { ... }
// export interface Victim extends BaseEntity { ... }
// export interface Vehicle extends BaseEntity { ... }
// export interface Location extends BaseEntity { ... }
