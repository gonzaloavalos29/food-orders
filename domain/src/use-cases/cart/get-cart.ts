import { Cart, User } from '../../entities';
import { CartRepository } from '../../repositories';

export class GetCartUseCase {
  constructor(private readonly carts: CartRepository) {}

  async execute(actor: User): Promise<Cart> {
    return (await this.carts.findByUserId(actor.id)) ?? Cart.empty(actor.id);
  }
}
