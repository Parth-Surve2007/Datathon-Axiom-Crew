// ─── Domain Constants ──────────────────────────────────────────────────────────

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  INVESTIGATOR: 'INVESTIGATOR',
  ANALYST: 'ANALYST',
  READONLY: 'READONLY',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const CRIME_CATEGORIES = {
  THEFT: 'THEFT',
  ROBBERY: 'ROBBERY',
  ASSAULT: 'ASSAULT',
  FRAUD: 'FRAUD',
  CYBERCRIME: 'CYBERCRIME',
  MURDER: 'MURDER',
  KIDNAPPING: 'KIDNAPPING',
  DRUG_OFFENSE: 'DRUG_OFFENSE',
  SEXUAL_OFFENSE: 'SEXUAL_OFFENSE',
  PROPERTY_DAMAGE: 'PROPERTY_DAMAGE',
  OTHER: 'OTHER',
} as const;

export type CrimeCategory = (typeof CRIME_CATEGORIES)[keyof typeof CRIME_CATEGORIES];

export const FIR_STATUS = {
  REGISTERED: 'REGISTERED',
  UNDER_INVESTIGATION: 'UNDER_INVESTIGATION',
  CHARGE_SHEETED: 'CHARGE_SHEETED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
} as const;

export type FirStatus = (typeof FIR_STATUS)[keyof typeof FIR_STATUS];

export const GRAPH_NODE_TYPES = {
  PERSON: 'PERSON',
  LOCATION: 'LOCATION',
  VEHICLE: 'VEHICLE',
  PHONE: 'PHONE',
  FIR: 'FIR',
  ORGANIZATION: 'ORGANIZATION',
} as const;

export type GraphNodeType = (typeof GRAPH_NODE_TYPES)[keyof typeof GRAPH_NODE_TYPES];

export const GRAPH_EDGE_TYPES = {
  ACCUSED_IN: 'ACCUSED_IN',
  VICTIM_IN: 'VICTIM_IN',
  KNOWN_ASSOCIATE: 'KNOWN_ASSOCIATE',
  LOCATED_AT: 'LOCATED_AT',
  OWNS_VEHICLE: 'OWNS_VEHICLE',
  USES_PHONE: 'USES_PHONE',
  MEMBER_OF: 'MEMBER_OF',
} as const;

export type GraphEdgeType = (typeof GRAPH_EDGE_TYPES)[keyof typeof GRAPH_EDGE_TYPES];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export * from './http';
export * from './errors';
