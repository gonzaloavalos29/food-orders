import { api } from '../api/client';
import type { OrderDto, OrderStatus } from '../api/types';

/** Statuses considered "active" from the kitchen's point of view. */
export const KITCHEN_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'];

/**
 * Client-side application layer for orders. Holds the kitchen-filtering rule and
 * unwraps the API envelope so components work with plain domain DTOs.
 */
export const ordersService = {
  list: (): Promise<OrderDto[]> => api.orders.list().then(r => r.orders),

  /** Orders still relevant to the kitchen (not delivered/cancelled). */
  listKitchen: (): Promise<OrderDto[]> =>
    api.orders.list().then(r => r.orders.filter(o => KITCHEN_STATUSES.includes(o.status))),

  get: (id: string): Promise<OrderDto> => api.orders.get(id).then(r => r.order),

  advance: (id: string, next: OrderStatus): Promise<OrderDto> =>
    api.orders.updateStatus(id, next).then(r => r.order),

  cancel: (id: string): Promise<OrderDto> => api.orders.cancel(id).then(r => r.order),

  /** Turns the current cart into a confirmed order. */
  checkout: (): Promise<OrderDto> => api.orders.checkout().then(r => r.order)
};
