import { Order, User } from '../../entities';
import { CartRepository, OrderRepository, ProductRepository } from '../../repositories';
import { Clock, IdGenerator } from '../../services';
import { ValidationError } from '../../errors';

export class CheckoutUseCase {
  constructor(
    private readonly carts: CartRepository,
    private readonly orders: OrderRepository,
    private readonly products: ProductRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock
  ) {}

  async execute(actor: User): Promise<Order> {
    const cart = await this.carts.findByUserId(actor.id);
    if (!cart || cart.isEmpty()) {
      throw new ValidationError('Cart is empty');
    }
    for (const item of cart.items) {
      const product = await this.products.findById(item.productId);
      if (!product || !product.available) {
        throw new ValidationError(`Product ${item.productId} is no longer available`);
      }
    }
    const now = this.clock.now();
    const order = Order.create({
      id: this.ids.generate(),
      userId: actor.id,
      items: cart.items.map(i => ({
        productId: i.productId,
        productName: i.productName,
        unitPrice: i.unitPrice,
        quantity: i.quantity
      })),
      status: 'PENDING',
      createdAt: now,
      updatedAt: now
    });
    await this.orders.save(order);
    await this.carts.deleteByUserId(actor.id);
    return order;
  }
}
