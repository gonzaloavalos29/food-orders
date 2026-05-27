import { DomainError } from './domain-error';

export class AuthorizationError extends DomainError {
  readonly code = 'AUTHORIZATION_ERROR';
}
