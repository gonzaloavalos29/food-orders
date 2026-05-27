import { Order, User } from '../../entities';
import { OrderRepository } from '../../repositories';
import { AuthorizationError, NotFoundError, ValidationError } from '../../errors';

export class CancelOrderUseCase {
  constructor(private readonly orders: OrderRepository) {}

  async execute(actor: User, orderId: string): Promise<Order> {
    const order = await this.orders.findById(orderId);
    if (!order) {
      throw new NotFoundError(`Order ${orderId} not found`);
    }
    const isOwner = order.userId === actor.id;
    if (!isOwner && !actor.canUpdateOrderStatus()) {
      throw new AuthorizationError('You cannot cancel this order');
    }
    if (isOwner && !actor.canUpdateOrderStatus() && !order.canBeCancelledByCustomer()) {
      throw new ValidationError(
        `Order in status ${order.status} cannot be cancelled by the customer`
      );
    }
    const cancelled = order.transitionTo('CANCELLED');
    await this.orders.save(cancelled);
    return cancelled;
  }
}
