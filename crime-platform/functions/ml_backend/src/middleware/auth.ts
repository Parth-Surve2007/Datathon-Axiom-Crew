import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authConfig } from '@config/index';
import { UnauthorizedError } from '@utils/errors';
import { createLogger } from '@config/logger';
import type { AuthenticatedUser } from '@app-types/index';

const log = createLogger('AuthMiddleware');

/**
 * Verifies the JWT from `Authorization: Bearer <token>`.
 * On success, attaches decoded user context to `req.user`.
 * On failure, passes an `UnauthorizedError` to the next error handler.
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    log.warn({ requestId: req.requestId, path: req.path }, 'Missing or malformed Authorization header');
    return next(new UnauthorizedError('Missing or malformed Authorization header'));
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, authConfig.jwtSecret) as AuthenticatedUser & { iat: number; exp: number };

    req.user = {
      id: decoded.id,
      email: decoded.email,
      badgeId: decoded.badgeId,
      role: decoded.role,
      stationId: decoded.stationId,
      name: decoded.name,
    };

    log.debug(
      { requestId: req.requestId, userId: req.user.id, role: req.user.role },
      'JWT verified successfully',
    );

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      log.warn({ requestId: req.requestId }, 'JWT token expired');
      return next(new UnauthorizedError('Token has expired. Please log in again.'));
    }
    if (err instanceof jwt.JsonWebTokenError) {
      log.warn({ requestId: req.requestId, err }, 'Invalid JWT token');
      return next(new UnauthorizedError('Invalid authentication token'));
    }
    next(err);
  }
};

/**
 * Signs a JWT payload and returns the signed token + expiry.
 */
export const signToken = (
  payload: AuthenticatedUser,
): { token: string; expiresIn: string } => {
  const token = jwt.sign(payload as unknown as object, authConfig.jwtSecret, {
    expiresIn: authConfig.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
  return { token, expiresIn: authConfig.jwtExpiresIn };
};

/**
 * Signs a refresh token with a longer expiry.
 */
export const signRefreshToken = (userId: string): string =>
  jwt.sign({ id: userId, type: 'refresh' }, authConfig.jwtSecret, {
    expiresIn: authConfig.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'],
  });

/**
 * Verifies a refresh token. Returns the user ID or throws.
 */
export const verifyRefreshToken = (token: string): string => {
  const decoded = jwt.verify(token, authConfig.jwtSecret) as { id: string; type: string };
  if (decoded.type !== 'refresh') throw new UnauthorizedError('Invalid refresh token');
  return decoded.id;
};
