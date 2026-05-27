import { PrismaClient } from '@prisma/client';
import { Email, User, UserRepository, UserRole } from '@food-orders/domain';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email.value,
        passwordHash: user.passwordHash,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      },
      update: {
        email: user.email.value,
        passwordHash: user.passwordHash,
        name: user.name,
        role: user.role
      }
    });
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email: email.value } });
    return row ? this.toDomain(row) : null;
  }

  private toDomain(row: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: string;
    createdAt: Date;
  }): User {
    return User.create({
      id: row.id,
      email: Email.create(row.email),
      passwordHash: row.passwordHash,
      name: row.name,
      role: row.role as UserRole,
      createdAt: row.createdAt
    });
  }
}
