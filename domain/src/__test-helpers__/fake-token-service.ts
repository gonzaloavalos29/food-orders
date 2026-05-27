import { TokenPayload, TokenService } from '../services';
import { AuthenticationError } from '../errors';

export class FakeTokenService implements TokenService {
  async sign(payload: TokenPayload): Promise<string> {
    return `token::${payload.userId}::${payload.role}`;
  }
  async verify(token: string): Promise<TokenPayload> {
    const parts = token.split('::');
    if (parts.length !== 3 || parts[0] !== 'token') {
      throw new AuthenticationError('Invalid token');
    }
    return { userId: parts[1], role: parts[2] as TokenPayload['role'] };
  }
}
