import { Cart, User } from '../../entities';
import { CartRepository } from '../../repositories';
import { NotFoundError } from '../../errors';

export interface UpdateCartItemQuantityInput {
  productId: string;
  quantity: number;
}

export class UpdateCartItemQuantityUseCase {
  constructor(private readonly carts: CartRepository) {}

  async execute(actor: User, input: UpdateCartItemQuantityInput): Promise<Cart> {
    const cart = await this.carts.findByUserId(actor.id);
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }
    const updated = cart.updateQuantity(input.productId, input.quantity);
    await this.carts.save(updated);
    return updated;
  }
}
