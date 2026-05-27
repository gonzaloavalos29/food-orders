import { Cart } from '../entities';

export interface CartRepository {
  findByUserId(userId: string): Promise<Cart | null>;
  save(cart: Cart): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}
