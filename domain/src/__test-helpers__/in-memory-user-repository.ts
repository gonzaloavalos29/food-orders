import { User } from '../entities';
import { Email } from '../value-objects';
import { UserRepository } from '../repositories';

export class InMemoryUserRepository implements UserRepository {
  private users = new Map<string, User>();

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    for (const u of this.users.values()) {
      if (u.email.equals(email)) return u;
    }
    return null;
  }

  size(): number {
    return this.users.size;
  }
}
