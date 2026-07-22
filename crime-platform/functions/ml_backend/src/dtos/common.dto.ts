import { z } from 'zod';

// ─── Reusable Primitives ───────────────────────────────────────────────────────

export const uuidSchema = z.string().uuid('Must be a valid UUID');

export const isoDateSchema = z.string().datetime({ offset: true, message: 'Must be a valid ISO 8601 date-time' });

export const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a date in YYYY-MM-DD format');

export const indianPhoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number starting with 6-9');

export const emailSchema = z.string().email('Must be a valid email address');

export const badgeIdSchema = z
  .string()
  .regex(/^[A-Z]{2,4}-\d{4,6}$/, 'Badge ID must be in format: KA-123456 or BLR-4921');

export const aadharSchema = z
  .string()
  .regex(/^\d{12}$/, 'Aadhaar number must be exactly 12 digits');

/** Karnataka vehicle registration: KA-01-AB-1234 */
export const vehicleRegSchema = z
  .string()
  .regex(
    /^[A-Z]{2}\d{2}[A-Z]{1,3}\d{4}$/,
    'Vehicle registration must match Karnataka format: KA01AB1234',
  );

/** FIR number: FIR/YYYY/NNNNNN */
export const firNumberSchema = z
  .string()
  .regex(/^[A-Z0-9]{2,10}\/\d{4}\/\d{1,10}$/, 'FIR number must match format: FIR/2024/000123');

/** Crime number: alphanumeric, max 50 */
export const crimeNumberSchema = z
  .string()
  .regex(/^[A-Z0-9\-\/]{1,50}$/, 'Crime number must be alphanumeric (max 50 characters)');

// ─── Pagination ────────────────────────────────────────────────────────────────
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ─── Search Query ──────────────────────────────────────────────────────────────
export const searchQuerySchema = paginationSchema.extend({
  q: z.string().trim().min(1).max(200).optional(),
});

// ─── Date Range ────────────────────────────────────────────────────────────────
export const dateRangeSchema = z
  .object({
    fromDate: isoDateSchema.optional(),
    toDate: isoDateSchema.optional(),
  })
  .refine(
    d => !d.fromDate || !d.toDate || new Date(d.fromDate) <= new Date(d.toDate),
    { message: '"fromDate" must be before "toDate"', path: ['fromDate'] },
  );

// ─── ID Params ─────────────────────────────────────────────────────────────────
export const idParamSchema = z.object({ id: uuidSchema });
export const firIdParamSchema = z.object({ firId: uuidSchema });
export const teamIdParamSchema = z.object({ teamId: uuidSchema });

// ─── Gender ────────────────────────────────────────────────────────────────────
export const genderSchema = z.enum(['M', 'F', 'OTHER']);

// ─── FIR Status ────────────────────────────────────────────────────────────────
export const firStatusSchema = z.enum([
  'REGISTERED',
  'UNDER_INVESTIGATION',
  'CHARGE_SHEETED',
  'CLOSED',
  'CANCELLED',
]);

// ─── User Roles ────────────────────────────────────────────────────────────────
export const userRoleSchema = z.enum(['ADMIN', 'SUPERVISOR', 'INVESTIGATOR', 'ANALYST', 'READONLY']);

// ─── Arrest Status ─────────────────────────────────────────────────────────────
export const arrestStatusSchema = z.enum(['WANTED', 'ARRESTED', 'BAILED', 'ABSCONDING', 'ACQUITTED']);

// ─── Evidence Types ────────────────────────────────────────────────────────────
export const evidenceTypeSchema = z.enum([
  'WEAPON',
  'DIGITAL',
  'BIOLOGICAL',
  'DOCUMENT',
  'VEHICLE',
  'SUBSTANCE',
  'OTHER',
]);

// ─── Address Types ─────────────────────────────────────────────────────────────
export const addressTypeSchema = z.enum(['PERMANENT', 'TEMPORARY', 'CURRENT', 'WORK']);

// ─── Person Vehicle Relation ───────────────────────────────────────────────────
export const vehicleRelationSchema = z.enum(['OWNER', 'DRIVER', 'ASSOCIATE']);

// ─── Chargesheet Status ────────────────────────────────────────────────────────
export const chargesheetStatusSchema = z.enum(['DRAFT', 'FILED', 'ACCEPTED', 'REJECTED']);

// ─── Court Case Status ─────────────────────────────────────────────────────────
export const courtCaseStatusSchema = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'ADJOURNED',
  'CONVICTED',
  'ACQUITTED',
  'DISMISSED',
]);

// ─── Injury Severity ───────────────────────────────────────────────────────────
export const injurySeveritySchema = z.enum(['NONE', 'MINOR', 'MODERATE', 'SEVERE', 'FATAL']);

// ─── Document Types ────────────────────────────────────────────────────────────
export const documentTypeSchema = z.enum([
  'FIR_COPY',
  'STATEMENT',
  'PANCHNAMA',
  'POST_MORTEM',
  'MEDICAL_REPORT',
  'FORENSIC_REPORT',
  'COURT_ORDER',
  'CHARGESHEET',
  'OTHER',
]);

// ─── Timeline Event Types ──────────────────────────────────────────────────────
export const timelineEventTypeSchema = z.enum([
  'INCIDENT',
  'FIR_REGISTERED',
  'ARREST',
  'BAIL_GRANTED',
  'CHARGESHEET_FILED',
  'COURT_HEARING',
  'EVIDENCE_COLLECTED',
  'WITNESS_STATEMENT',
  'INVESTIGATION_UPDATE',
  'STATUS_CHANGE',
  'OTHER',
]);

// ─── Organization Types ────────────────────────────────────────────────────────
export const organizationTypeSchema = z.enum([
  'GANG',
  'COMPANY',
  'NGO',
  'GOVERNMENT',
  'CRIMINAL_SYNDICATE',
  'OTHER',
]);

// ─── Officer Ranks ─────────────────────────────────────────────────────────────
export const officerRankSchema = z.enum([
  'CONSTABLE',
  'HEAD_CONSTABLE',
  'ASI',
  'SI',
  'PSI',
  'PI',
  'DySP',
  'SP',
  'SSP',
  'DIG',
  'IG',
  'ADGP',
  'DGP',
]);
