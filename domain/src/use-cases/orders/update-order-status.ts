import { Order, OrderStatus, User } from '../../entities';
import { OrderRepository } from '../../repositories';
import { AuthorizationError, NotFoundError } from '../../errors';

export interface UpdateOrderStatusInput {
  orderId: string;
  nextStatus: OrderStatus;
}

export class UpdateOrderStatusUseCase {
  constructor(private readonly orders: OrderRepository) {}

  async execute(actor: User, input: UpdateOrderStatusInput): Promise<Order> {
    if (!actor.canUpdateOrderStatus()) {
      throw new AuthorizationError('Only staff or admins can update order status');
    }
    const order = await this.orders.findById(input.orderId);
    if (!order) {
      throw new NotFoundError(`Order ${input.orderId} not found`);
    }
    const updated = order.transitionTo(input.nextStatus);
    await this.orders.save(updated);
    return updated;
  }
}
