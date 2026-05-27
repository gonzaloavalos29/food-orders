import { Order, User } from '../../entities';
import { OrderRepository } from '../../repositories';
import { AuthorizationError, NotFoundError } from '../../errors';

export class GetOrderUseCase {
  constructor(private readonly orders: OrderRepository) {}

  async execute(actor: User, id: string): Promise<Order> {
    const order = await this.orders.findById(id);
    if (!order) {
      throw new NotFoundError(`Order ${id} not found`);
    }
    if (order.userId !== actor.id && !actor.canViewAllOrders()) {
      throw new AuthorizationError('You cannot view this order');
    }
    return order;
  }
}
