import { Order, OrderStatus, User } from '../../entities';
import { OrderRepository } from '../../repositories';

export interface ListOrdersInput {
  status?: OrderStatus;
}

export class ListOrdersUseCase {
  constructor(private readonly orders: OrderRepository) {}

  async execute(actor: User, input: ListOrdersInput = {}): Promise<Order[]> {
    if (actor.canViewAllOrders()) {
      return this.orders.findAll({ status: input.status });
    }
    return this.orders.findAll({ userId: actor.id, status: input.status });
  }
}
