import { Cart, User } from '../../entities';
import { CartRepository } from '../../repositories';

export class RemoveFromCartUseCase {
  constructor(private readonly carts: CartRepository) {}

  async execute(actor: User, productId: string): Promise<Cart> {
    const cart = (await this.carts.findByUserId(actor.id)) ?? Cart.empty(actor.id);
    const updated = cart.removeItem(productId);
    await this.carts.save(updated);
    return updated;
  }
}
