import { RegisterUserUseCase } from './register-user';
import { InMemoryUserRepository } from '../../__test-helpers__/in-memory-user-repository';
import { FakePasswordHasher } from '../../__test-helpers__/fake-password-hasher';
import { CounterIdGenerator } from '../../__test-helpers__/counter-id-generator';
import { FixedClock } from '../../__test-helpers__/fixed-clock';
import { ConflictError, ValidationError } from '../../errors';
import { Email } from '../../value-objects';

const setup = () => {
  const users = new InMemoryUserRepository();
  const hasher = new FakePasswordHasher();
  const ids = new CounterIdGenerator('user');
  const clock = new FixedClock(new Date('2026-01-01T00:00:00Z'));
  const uc = new RegisterUserUseCase(users, hasher, ids, clock);
  return { uc, users, hasher, ids, clock };
};

describe('RegisterUserUseCase', () => {
  it('registers a new customer by default', async () => {
    const { uc, users } = setup();
    const user = await uc.execute({
      email: 'alice@example.com',
      password: 'password123',
      name: 'Alice'
    });
    expect(user.id).toBe('user-1');
    expect(user.role).toBe('CUSTOMER');
    expect(user.email.value).toBe('alice@example.com');
    expect(user.passwordHash).toBe('hashed::password123');
    expect(await users.findByEmail(Email.create('alice@example.com'))).not.toBeNull();
  });

  it('rejects duplicate email', async () => {
    const { uc } = setup();
    await uc.execute({ email: 'a@b.com', password: 'password123', name: 'A' });
    await expect(
      uc.execute({ email: 'a@b.com', password: 'password123', name: 'A2' })
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('rejects password shorter than 8 characters', async () => {
    const { uc } = setup();
    await expect(
      uc.execute({ email: 'a@b.com', password: 'short', name: 'A' })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('rejects invalid email', async () => {
    const { uc } = setup();
    await expect(
      uc.execute({ email: 'not-an-email', password: 'password123', name: 'A' })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('can create staff/admin when explicitly requested', async () => {
    const { uc } = setup();
    const admin = await uc.execute({
      email: 'admin@example.com',
      password: 'password123',
      name: 'Admin',
      role: 'ADMIN'
    });
    expect(admin.role).toBe('ADMIN');
  });
});
