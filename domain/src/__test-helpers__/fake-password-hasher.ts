import { PasswordHasher } from '../services';

export class FakePasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return `hashed::${password}`;
  }
  async verify(password: string, hash: string): Promise<boolean> {
    return hash === `hashed::${password}`;
  }
}
