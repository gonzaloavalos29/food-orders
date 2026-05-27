import { DomainError } from './domain-error';

export class AuthenticationError extends DomainError {
  readonly code = 'AUTHENTICATION_ERROR';
}
