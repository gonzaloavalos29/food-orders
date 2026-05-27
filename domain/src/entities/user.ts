import { Email } from '../value-objects';
import { ValidationError } from '../errors';

export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

const VALID_ROLES: UserRole[] = ['CUSTOMER', 'STAFF', 'ADMIN'];

export interface UserProps {
  id: string;
  email: Email;
  passwordHash: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: UserProps): User {
    if (!props.id || props.id.trim().length === 0) {
      throw new ValidationError('User id is required');
    }
    if (!props.passwordHash || props.passwordHash.trim().length === 0) {
      throw new ValidationError('User password hash is required');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationError('User name is required');
    }
    if (!VALID_ROLES.includes(props.role)) {
      throw new ValidationError(`Invalid user role: ${props.role}`);
    }
    return new User({ ...props, name: props.name.trim() });
  }

  get id(): string { return this.props.id; }
  get email(): Email { return this.props.email; }
  get passwordHash(): string { return this.props.passwordHash; }
  get name(): string { return this.props.name; }
  get role(): UserRole { return this.props.role; }
  get createdAt(): Date { return this.props.createdAt; }

  canManageProducts(): boolean {
    return this.props.role === 'ADMIN';
  }

  canUpdateOrderStatus(): boolean {
    return this.props.role === 'ADMIN' || this.props.role === 'STAFF';
  }

  canViewAllOrders(): boolean {
    return this.props.role === 'ADMIN' || this.props.role === 'STAFF';
  }
}
