import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ordersService } from './ordersService';
import type { OrderDto, OrderStatus } from '../api/types';

vi.mock('../api/client', () => ({
  api: {
    orders: {
      list: vi.fn(),
      get: vi.fn(),
      updateStatus: vi.fn(),
      cancel: vi.fn(),
      checkout: vi.fn()
    }
  }
}));

import { api } from '../api/client';

const mock = (fn: unknown) => fn as ReturnType<typeof vi.fn>;

const order = (status: OrderStatus): OrderDto => ({
  id: status.toLowerCase(),
  userId: 'u1',
  status,
  items: [],
  totalInCents: 0,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01'
});

describe('ordersService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns the full list unwrapped', async () => {
    const orders = [order('PENDING'), order('DELIVERED')];
    mock(api.orders.list).mockResolvedValue({ orders });
    await expect(ordersService.list()).resolves.toEqual(orders);
  });

  it('keeps only active statuses for the kitchen view', async () => {
    mock(api.orders.list).mockResolvedValue({
      orders: [order('PENDING'), order('PREPARING'), order('DELIVERED'), order('CANCELLED')]
    });
    const result = await ordersService.listKitchen();
    expect(result.map(o => o.status)).toEqual(['PENDING', 'PREPARING']);
  });

  it('advances an order to the given status', async () => {
    mock(api.orders.updateStatus).mockResolvedValue({ order: order('CONFIRMED') });
    await ordersService.advance('o1', 'CONFIRMED');
    expect(api.orders.updateStatus).toHaveBeenCalledWith('o1', 'CONFIRMED');
  });

  it('unwraps the order on checkout', async () => {
    const o = order('PENDING');
    mock(api.orders.checkout).mockResolvedValue({ order: o });
    await expect(ordersService.checkout()).resolves.toBe(o);
  });

  it('gets a single order unwrapped', async () => {
    const o = order('CONFIRMED');
    mock(api.orders.get).mockResolvedValue({ order: o });
    await expect(ordersService.get('o1')).resolves.toBe(o);
    expect(api.orders.get).toHaveBeenCalledWith('o1');
  });

  it('cancels an order unwrapped', async () => {
    const o = order('CANCELLED');
    mock(api.orders.cancel).mockResolvedValue({ order: o });
    await expect(ordersService.cancel('o1')).resolves.toBe(o);
    expect(api.orders.cancel).toHaveBeenCalledWith('o1');
  });
});
