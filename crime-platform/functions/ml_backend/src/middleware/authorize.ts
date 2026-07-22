import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '@utils/errors';
import { createLogger } from '@config/logger';
import type { UserRole } from '@constants/index';

const log = createLogger('AuthorizeMiddleware');

/**
 * RBAC authorization guard factory.
 *
 * Usage:
 *   router.delete('/users/:id', authenticate, authorize('ADMIN'), controller.delete);
 *   router.put('/firs/:id', authenticate, authorize('ADMIN', 'SUPERVISOR', 'INVESTIGATOR'), controller.update);
 *
 * @param roles - One or more roles that are permitted to access the route.
 */
export const authorize =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      log.warn({ requestId: req.requestId, path: req.path }, 'authorize() called without authenticated user');
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      log.warn(
        {
          requestId: req.requestId,
          userId: req.user.id,
          role: req.user.role,
          required: roles,
          path: req.path,
        },
        'Authorization denied — insufficient role',
      );
      return next(
        new ForbiddenError(
          `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
        ),
      );
    }

    log.debug(
      { requestId: req.requestId, userId: req.user.id, role: req.user.role },
      'Authorization granted',
    );

    next();
  };

/**
 * Checks if the requesting user owns the target resource (or is an Admin/Supervisor).
 * Useful for "only update your own profile" type rules.
 *
 * @param getOwnerId - Extracts the owner's user ID from the request (e.g., from params or a pre-loaded entity).
 */
export const authorizeOwnerOrAdmin =
  (getOwnerId: (req: Request) => string) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const ownerId = getOwnerId(req);
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPERVISOR';
    const isOwner = req.user.id === ownerId;

    if (!isAdmin && !isOwner) {
      log.warn(
        { requestId: req.requestId, userId: req.user.id, ownerId },
        'Authorization denied — not owner or admin',
      );
      return next(new ForbiddenError('You do not have permission to modify this resource'));
    }

    next();
  };
