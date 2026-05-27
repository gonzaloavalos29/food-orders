import { User, UserRole } from '../../entities';
import { UserRepository } from '../../repositories';
import { Clock, IdGenerator, PasswordHasher } from '../../services';
import { Email } from '../../value-objects';
import { ConflictError, ValidationError } from '../../errors';

export interface RegisterUserInput {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

const MIN_PASSWORD_LENGTH = 8;

export class RegisterUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly ids: IdGenerator,
    private readonly clock: Clock
  ) {}

  async execute(input: RegisterUserInput): Promise<User> {
    if (!input.password || input.password.length < MIN_PASSWORD_LENGTH) {
      throw new ValidationError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
      );
    }
    const email = Email.create(input.email);
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictError(`A user with email ${email.value} already exists`);
    }
    const passwordHash = await this.hasher.hash(input.password);
    const user = User.create({
      id: this.ids.generate(),
      email,
      passwordHash,
      name: input.name,
      role: input.role ?? 'CUSTOMER',
      createdAt: this.clock.now()
    });
    await this.users.save(user);
    return user;
  }
}
