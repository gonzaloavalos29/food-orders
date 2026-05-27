import bcrypt from 'bcryptjs';
import { PasswordHasher } from '@food-orders/domain';

export class BcryptPasswordHasher implements PasswordHasher {
  constructor(private readonly rounds = 10) {}
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.rounds);
  }
  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
