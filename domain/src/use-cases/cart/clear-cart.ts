import { Cart, User } from '../../entities';
import { CartRepository } from '../../repositories';

export class ClearCartUseCase {
  constructor(private readonly carts: CartRepository) {}

  async execute(actor: User): Promise<Cart> {
    const empty = Cart.empty(actor.id);
    await this.carts.save(empty);
    return empty;
  }
}
