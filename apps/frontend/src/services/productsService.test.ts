import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productsService } from './productsService';

vi.mock('../api/client', () => ({
  api: {
    products: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn()
    }
  }
}));

import { api } from '../api/client';

const mock = (fn: unknown) => fn as ReturnType<typeof vi.fn>;

describe('productsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock(api.products.list).mockResolvedValue({ products: [] });
  });

  it('treats "ALL" as no category filter', async () => {
    await productsService.list('ALL');
    expect(api.products.list).toHaveBeenCalledWith({ category: undefined });
  });

  it('passes a concrete category through', async () => {
    await productsService.list('PIZZA');
    expect(api.products.list).toHaveBeenCalledWith({ category: 'PIZZA' });
  });

  it('defaults to "ALL" when called with no argument', async () => {
    await productsService.list();
    expect(api.products.list).toHaveBeenCalledWith({ category: undefined });
  });

  it('requests unavailable products for the admin listing', async () => {
    await productsService.listAll();
    expect(api.products.list).toHaveBeenCalledWith({ includeUnavailable: true });
  });

  it('toggles availability through a PATCH', async () => {
    mock(api.products.update).mockResolvedValue({ product: {} });
    await productsService.setAvailable('p1', false);
    expect(api.products.update).toHaveBeenCalledWith('p1', { available: false });
  });

  it('gets a product unwrapped', async () => {
    mock(api.products.get).mockResolvedValue({ product: { id: 'p1' } });
    await expect(productsService.get('p1')).resolves.toEqual({ id: 'p1' });
  });

  it('creates a product unwrapped', async () => {
    const input = { name: 'P', description: '', priceInCents: 100, category: 'PIZZA' as const, available: true };
    mock(api.products.create).mockResolvedValue({ product: { id: 'p2' } });
    await expect(productsService.create(input)).resolves.toEqual({ id: 'p2' });
    expect(api.products.create).toHaveBeenCalledWith(input);
  });

  it('updates a product unwrapped', async () => {
    mock(api.products.update).mockResolvedValue({ product: { id: 'p1', name: 'X' } });
    await expect(productsService.update('p1', { name: 'X' })).resolves.toEqual({ id: 'p1', name: 'X' });
    expect(api.products.update).toHaveBeenCalledWith('p1', { name: 'X' });
  });

  it('removes a product', async () => {
    mock(api.products.remove).mockResolvedValue(undefined);
    await productsService.remove('p1');
    expect(api.products.remove).toHaveBeenCalledWith('p1');
  });
});
