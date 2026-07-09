import { User, UserRole } from './user';
import { Email } from '../value-objects';
import { ValidationError } from '../errors';

describe('User', () => {
  const validProps = {
    id: 'user-1',
    email: Email.create('alice@example.com'),
    passwordHash: 'hashed',
    name: 'Alice',
    role: 'CUSTOMER' as UserRole,
    createdAt: new Date('2026-01-01')
  };

  it('creates a user with valid props', () => {
    const u = User.create(validProps);
    expect(u.id).toBe('user-1');
    expect(u.email.value).toBe('alice@example.com');
    expect(u.role).toBe('CUSTOMER');
    expect(u.name).toBe('Alice');
  });

  it('rejects empty name', () => {
    expect(() => User.create({ ...validProps, name: '   ' })).toThrow(ValidationError);
  });

  it('rejects empty password hash', () => {
    expect(() => User.create({ ...validProps, passwordHash: '' })).toThrow(ValidationError);
  });

  it('rejects unknown role', () => {
    expect(() =>
      User.create({ ...validProps, role: 'INVALID' as UserRole })
    ).toThrow(ValidationError);
  });

  it('rejects empty id', () => {
    expect(() => User.create({ ...validProps, id: '   ' })).toThrow(ValidationError);
  });

  it('exposes passwordHash and createdAt', () => {
    const u = User.create(validProps);
    expect(u.passwordHash).toBe(validProps.passwordHash);
    expect(u.createdAt).toEqual(validProps.createdAt);
  });

  describe('roles & permissions', () => {
    it('CUSTOMER cannot manage products', () => {
      const u = User.create({ ...validProps, role: 'CUSTOMER' });
      expect(u.canManageProducts()).toBe(false);
    });

    it('ADMIN can manage products', () => {
      const u = User.create({ ...validProps, role: 'ADMIN' });
      expect(u.canManageProducts()).toBe(true);
    });

    it('STAFF can update order status but not manage products', () => {
      const u = User.create({ ...validProps, role: 'STAFF' });
      expect(u.canUpdateOrderStatus()).toBe(true);
      expect(u.canManageProducts()).toBe(false);
    });

    it('ADMIN can update order status', () => {
      const u = User.create({ ...validProps, role: 'ADMIN' });
      expect(u.canUpdateOrderStatus()).toBe(true);
    });

    it('CUSTOMER cannot update order status', () => {
      const u = User.create({ ...validProps, role: 'CUSTOMER' });
      expect(u.canUpdateOrderStatus()).toBe(false);
    });

    it('ADMIN and STAFF can view all orders; CUSTOMER cannot', () => {
      expect(User.create({ ...validProps, role: 'ADMIN' }).canViewAllOrders()).toBe(true);
      expect(User.create({ ...validProps, role: 'STAFF' }).canViewAllOrders()).toBe(true);
      expect(User.create({ ...validProps, role: 'CUSTOMER' }).canViewAllOrders()).toBe(false);
    });
  });
});
