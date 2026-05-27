import { Order, OrderStatus } from '../entities';

export interface OrderFilter {
  userId?: string;
  status?: OrderStatus;
}

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findAll(filter?: OrderFilter): Promise<Order[]>;
}
