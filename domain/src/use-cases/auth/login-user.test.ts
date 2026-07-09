import { LoginUserUseCase } from './login-user';
import { RegisterUserUseCase } from './register-user';
import { InMemoryUserRepository } from '../../__test-helpers__/in-memory-user-repository';
import { FakePasswordHasher } from '../../__test-helpers__/fake-password-hasher';
import { CounterIdGenerator } from '../../__test-helpers__/counter-id-generator';
import { FixedClock } from '../../__test-helpers__/fixed-clock';
import { FakeTokenService } from '../../__test-helpers__/fake-token-service';
import { AuthenticationError } from '../../errors';

const setup = async () => {
  const users = new InMemoryUserRepository();
  const hasher = new FakePasswordHasher();
  const ids = new CounterIdGenerator('user');
  const clock = new FixedClock(new Date('2026-01-01T00:00:00Z'));
  const tokens = new FakeTokenService();
  const register = new RegisterUserUseCase(users, hasher, ids, clock);
  const login = new LoginUserUseCase(users, hasher, tokens);
  await register.execute({ email: 'alice@example.com', password: 'password123', name: 'Alice' });
  return { login };
};

describe('LoginUserUseCase', () => {
  it('logs in with correct credentials', async () => {
    const { login } = await setup();
    const result = await login.execute({ email: 'alice@example.com', password: 'password123' });
    expect(result.token).toBe('token::user-1::CUSTOMER');
    expect(result.user.email.value).toBe('alice@example.com');
  });

  it('rejects unknown email', async () => {
    const { login } = await setup();
    await expect(
      login.execute({ email: 'unknown@example.com', password: 'password123' })
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('rejects wrong password', async () => {
    const { login } = await setup();
    await expect(
      login.execute({ email: 'alice@example.com', password: 'wrongpass' })
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('is case-insensitive for email', async () => {
    const { login } = await setup();
    const result = await login.execute({ email: 'ALICE@EXAMPLE.COM', password: 'password123' });
    expect(result.user.email.value).toBe('alice@example.com');
  });

  it('rejects a malformed email without leaking that it is invalid', async () => {
    const { login } = await setup();
    await expect(
      login.execute({ email: 'not-an-email', password: 'password123' })
    ).rejects.toBeInstanceOf(AuthenticationError);
  });
});
