import { Cart } from '../entities';
import { CartRepository } from '../repositories';

export class InMemoryCartRepository implements CartRepository {
  private carts = new Map<string, Cart>();

  async findByUserId(userId: string): Promise<Cart | null> {
    return this.carts.get(userId) ?? null;
  }

  async save(cart: Cart): Promise<void> {
    this.carts.set(cart.userId, cart);
  }

  async deleteByUserId(userId: string): Promise<void> {
    this.carts.delete(userId);
  }
}
