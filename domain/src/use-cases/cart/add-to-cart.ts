import { Cart, User } from '../../entities';
import { CartRepository, ProductRepository } from '../../repositories';
import { NotFoundError, ValidationError } from '../../errors';

export interface AddToCartInput {
  productId: string;
  quantity: number;
}

export class AddToCartUseCase {
  constructor(
    private readonly carts: CartRepository,
    private readonly products: ProductRepository
  ) {}

  async execute(actor: User, input: AddToCartInput): Promise<Cart> {
    if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
      throw new ValidationError('Quantity must be a positive integer');
    }
    const product = await this.products.findById(input.productId);
    if (!product) {
      throw new NotFoundError(`Product ${input.productId} not found`);
    }
    const cart =
      (await this.carts.findByUserId(actor.id)) ?? Cart.empty(actor.id);
    const updated = cart.addItem(product, input.quantity);
    await this.carts.save(updated);
    return updated;
  }
}
