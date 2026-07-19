import { getPgPool } from '@config/database';
import { createLogger } from '@config/logger';

const log = createLogger('AuditLogger');

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'RESTORE'
  | 'ASSIGN'
  | 'UNASSIGN'
  | 'STATUS_CHANGE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'BULK_CREATE'
  | 'BULK_DELETE';

export interface AuditEntry {
  userId: string | null;
  action: AuditAction;
  tableName: string;
  recordId: string | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}

/**
 * AuditLogger writes an entry to the `audit_logs` table after every
 * mutating operation (Create, Update, Delete, Restore, Assignment, Status Change).
 *
 * It is database-agnostic at the interface level, but currently backed by
 * the PostgreSQL pool directly (audit logs are internal application data,
 * not user-facing, so they live exclusively in Postgres regardless of DB_PROVIDER).
 *
 * Failures are logged but do NOT throw — audit failures must never break
 * the primary operation.
 */
export class AuditLogger {
  private static instance: AuditLogger;

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  async log(entry: AuditEntry): Promise<void> {
    try {
      const pool = getPgPool();
      await pool.query(
        `INSERT INTO audit_logs
          (user_id, action, table_name, record_id, old_values, new_values, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [
          entry.userId,
          entry.action,
          entry.tableName,
          entry.recordId,
          entry.oldValues ? JSON.stringify(entry.oldValues) : null,
          entry.newValues ? JSON.stringify(entry.newValues) : null,
        ],
      );
    } catch (err) {
      // Audit failures are non-fatal — log and continue
      log.error(
        { err, entry: { ...entry, oldValues: '[omitted]', newValues: '[omitted]' } },
        'Failed to write audit log entry',
      );
    }
  }

  /**
   * Convenience: log a CREATE event.
   */
  async logCreate(params: {
    userId: string | null;
    tableName: string;
    recordId: string;
    newValues: Record<string, unknown>;
  }): Promise<void> {
    return this.log({ ...params, action: 'CREATE', oldValues: null });
  }

  /**
   * Convenience: log an UPDATE event.
   */
  async logUpdate(params: {
    userId: string | null;
    tableName: string;
    recordId: string;
    oldValues: Record<string, unknown>;
    newValues: Record<string, unknown>;
  }): Promise<void> {
    return this.log({ ...params, action: 'UPDATE' });
  }

  /**
   * Convenience: log a SOFT DELETE event.
   */
  async logDelete(params: {
    userId: string | null;
    tableName: string;
    recordId: string;
    oldValues: Record<string, unknown>;
  }): Promise<void> {
    return this.log({ ...params, action: 'DELETE', newValues: null });
  }

  /**
   * Convenience: log a RESTORE event.
   */
  async logRestore(params: {
    userId: string | null;
    tableName: string;
    recordId: string;
  }): Promise<void> {
    return this.log({ ...params, action: 'RESTORE', oldValues: null, newValues: null });
  }

  /**
   * Convenience: log a STATUS_CHANGE event.
   */
  async logStatusChange(params: {
    userId: string | null;
    tableName: string;
    recordId: string;
    oldStatus: string;
    newStatus: string;
  }): Promise<void> {
    return this.log({
      userId: params.userId,
      action: 'STATUS_CHANGE',
      tableName: params.tableName,
      recordId: params.recordId,
      oldValues: { status: params.oldStatus },
      newValues: { status: params.newStatus },
    });
  }
}

/** Singleton instance for use throughout the application */
export const auditLogger = AuditLogger.getInstance();
