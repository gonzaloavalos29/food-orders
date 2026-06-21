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
});
