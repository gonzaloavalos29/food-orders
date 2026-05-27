import { NextFunction, Request, Response } from 'express';
import {
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  DomainError,
  NotFoundError,
  ValidationError
} from '@food-orders/domain';

const statusFor = (err: DomainError): number => {
  if (err instanceof ValidationError) return 400;
  if (err instanceof AuthenticationError) return 401;
  if (err instanceof AuthorizationError) return 403;
  if (err instanceof NotFoundError) return 404;
  if (err instanceof ConflictError) return 409;
  return 500;
};

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof DomainError) {
    res.status(statusFor(err)).json({ error: { code: err.code, message: err.message } });
    return;
  }
  // eslint-disable-next-line no-console
  console.error('Unexpected error:', err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error' } });
}
