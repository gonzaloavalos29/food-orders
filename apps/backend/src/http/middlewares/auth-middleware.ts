import { NextFunction, Request, Response } from 'express';
import {
  AuthenticationError,
  TokenService,
  User,
  UserRepository
} from '@food-orders/domain';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

export const makeAuthMiddleware = (tokens: TokenService, users: UserRepository) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const header = req.header('authorization');
      if (!header || !header.startsWith('Bearer ')) {
        throw new AuthenticationError('Missing Bearer token');
      }
      const payload = await tokens.verify(header.slice('Bearer '.length));
      const user = await users.findById(payload.userId);
      if (!user) {
        throw new AuthenticationError('User not found for token');
      }
      req.user = user;
      next();
    } catch (e) {
      next(e);
    }
  };
};

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new AuthenticationError('Authentication required'));
    return;
  }
  next();
};
