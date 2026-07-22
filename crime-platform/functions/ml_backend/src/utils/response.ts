import type { Response } from 'express';
import type { ApiSuccessResponse, ApiErrorResponse, PaginationMeta } from '../types/api';
import { HTTP_STATUS } from '@constants/http';

/**
 * Send a standardised JSON success response.
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  options: {
    message?: string;
    statusCode?: number;
    meta?: PaginationMeta;
  } = {},
): void => {
  const requestId = (res.req as { requestId?: string }).requestId ?? 'unknown';
  const response: ApiSuccessResponse<T> = {
    success: true,
    statusCode: options.statusCode ?? HTTP_STATUS.OK,
    message: options.message ?? 'OK',
    data,
    meta: options.meta,
    requestId,
    timestamp: new Date().toISOString(),
  };
  res.status(response.statusCode).json(response);
};

/**
 * Send a standardised JSON error response.
 */
export const sendError = (
  res: Response,
  options: {
    statusCode?: number;
    code?: string;
    message?: string;
    details?: unknown;
  } = {},
): void => {
  const requestId = (res.req as { requestId?: string }).requestId ?? 'unknown';
  const response: ApiErrorResponse = {
    success: false,
    statusCode: options.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: options.code ?? 'INTERNAL_ERROR',
    message: options.message ?? 'An unexpected error occurred',
    details: options.details,
    requestId,
    timestamp: new Date().toISOString(),
  };
  res.status(response.statusCode).json(response);
};

/**
 * Build a PaginationMeta object from query parameters and a total count.
 */
export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number,
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};
