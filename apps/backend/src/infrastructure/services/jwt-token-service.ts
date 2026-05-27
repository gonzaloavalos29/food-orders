import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthenticationError, TokenPayload, TokenService } from '@food-orders/domain';

export class JwtTokenService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string
  ) {}

  async sign(payload: TokenPayload): Promise<string> {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn } as SignOptions);
  }

  async verify(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      return { userId: decoded.userId, role: decoded.role };
    } catch {
      throw new AuthenticationError('Invalid or expired token');
    }
  }
}
