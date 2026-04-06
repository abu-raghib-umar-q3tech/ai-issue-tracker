import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { RequestHandler } from 'express';
import { env } from '../config/env.js';
import { USER_ROLES, type UserRole } from '../models/user.model.js';
import type { AuthTokenPayload } from '../types/auth.js';

const extractBearerToken = (authorizationHeader?: string): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

const isUserRole = (value: unknown): value is UserRole => {
  return typeof value === 'string' && USER_ROLES.includes(value as UserRole);
};

const isAuthTokenPayload = (value: string | JwtPayload): value is JwtPayload & AuthTokenPayload => {
  if (typeof value === 'string') {
    return false;
  }

  return typeof value.sub === 'string' && typeof value.email === 'string' && isUserRole(value.role);
};

const authenticateUser: RequestHandler<any, any, any, any> = (req, res, next): void => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    res.status(401).json({ message: 'Authentication token is required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    if (!isAuthTokenPayload(decoded)) {
      res.status(401).json({ message: 'Invalid authentication token' });
      return;
    }

    req.user = {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (_error: unknown) {
    res.status(401).json({ message: 'Invalid or expired authentication token' });
  }
};

export { authenticateUser };
