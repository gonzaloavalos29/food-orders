import { Order } from '../entities';
import { OrderFilter, OrderRepository } from '../repositories';

export class InMemoryOrderRepository implements OrderRepository {
  private orders = new Map<string, Order>();

  async save(order: Order): Promise<void> {
    this.orders.set(order.id, order);
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) ?? null;
  }

  async findAll(filter?: OrderFilter): Promise<Order[]> {
    let result = Array.from(this.orders.values());
    if (filter?.userId) {
      result = result.filter(o => o.userId === filter.userId);
    }
    if (filter?.status) {
      result = result.filter(o => o.status === filter.status);
    }
    return result;
  }
}
