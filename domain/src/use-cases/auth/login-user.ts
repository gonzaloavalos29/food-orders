import { User } from '../../entities';
import { UserRepository } from '../../repositories';
import { PasswordHasher, TokenService } from '../../services';
import { Email } from '../../value-objects';
import { AuthenticationError } from '../../errors';

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  user: User;
  token: string;
}

export class LoginUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    let email: Email;
    try {
      email = Email.create(input.email);
    } catch {
      throw new AuthenticationError('Invalid email or password');
    }
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }
    const ok = await this.hasher.verify(input.password, user.passwordHash);
    if (!ok) {
      throw new AuthenticationError('Invalid email or password');
    }
    const token = await this.tokens.sign({ userId: user.id, role: user.role });
    return { user, token };
  }
}
