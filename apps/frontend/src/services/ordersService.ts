import { api } from '../api/client';
import type { OrderDto, OrderStatus } from '../api/types';

export const KITCHEN_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'];

export const ordersService = {
  list: (): Promise<OrderDto[]> => api.orders.list().then(r => r.orders),

  listKitchen: (): Promise<OrderDto[]> =>
    api.orders.list().then(r => r.orders.filter(o => KITCHEN_STATUSES.includes(o.status))),

  get: (id: string): Promise<OrderDto> => api.orders.get(id).then(r => r.order),

  advance: (id: string, next: OrderStatus): Promise<OrderDto> =>
    api.orders.updateStatus(id, next).then(r => r.order),

  cancel: (id: string): Promise<OrderDto> => api.orders.cancel(id).then(r => r.order),

  checkout: (): Promise<OrderDto> => api.orders.checkout().then(r => r.order)
};
