import { UserRole } from '../entities';

export interface TokenPayload {
  userId: string;
  role: UserRole;
}

export interface TokenService {
  sign(payload: TokenPayload): Promise<string>;
  verify(token: string): Promise<TokenPayload>;
}
