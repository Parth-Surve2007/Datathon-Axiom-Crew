import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '@constants/index';

// ─── Augment Express Request ───────────────────────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      /** Unique request ID injected by requestId middleware */
      requestId: string;
      /** Authenticated user context injected by auth middleware */
      user?: AuthenticatedUser;
      /** Request start time for latency tracking */
      startTime: number;
    }
  }
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  badgeId: string;
  role: UserRole;
  stationId: string;
  name: string;
}

// ─── API Response Envelope ─────────────────────────────────────────────────────
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
  requestId: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
  requestId: string;
  timestamp: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Pagination ────────────────────────────────────────────────────────────────
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Controller / Handler types ────────────────────────────────────────────────
export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;
