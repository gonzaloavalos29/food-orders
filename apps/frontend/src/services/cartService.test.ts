import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cartService } from './cartService';

vi.mock('../api/client', () => ({
  api: {
    cart: {
      get: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn()
    }
  }
}));

import { api } from '../api/client';

const cart = { userId: 'u1', items: [], totalInCents: 0 };
const mock = (fn: unknown) => fn as ReturnType<typeof vi.fn>;

describe('cartService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('unwraps the cart envelope on get', async () => {
    mock(api.cart.get).mockResolvedValue({ cart });
    await expect(cartService.get()).resolves.toBe(cart);
  });

  it('adds with a default quantity of 1', async () => {
    mock(api.cart.add).mockResolvedValue({ cart });
    await cartService.add('p1');
    expect(api.cart.add).toHaveBeenCalledWith({ productId: 'p1', quantity: 1 });
  });

  it('updates the quantity when it is positive', async () => {
    mock(api.cart.update).mockResolvedValue({ cart });
    await cartService.changeQuantity('p1', 3);
    expect(api.cart.update).toHaveBeenCalledWith('p1', 3);
    expect(api.cart.remove).not.toHaveBeenCalled();
  });

  it('removes the item when the quantity drops to zero', async () => {
    mock(api.cart.remove).mockResolvedValue({ cart });
    await cartService.changeQuantity('p1', 0);
    expect(api.cart.remove).toHaveBeenCalledWith('p1');
    expect(api.cart.update).not.toHaveBeenCalled();
  });

  it('removes the item for negative quantities too', async () => {
    mock(api.cart.remove).mockResolvedValue({ cart });
    await cartService.changeQuantity('p1', -2);
    expect(api.cart.remove).toHaveBeenCalledWith('p1');
  });

  it('removes an item directly', async () => {
    mock(api.cart.remove).mockResolvedValue({ cart });
    await expect(cartService.remove('p1')).resolves.toBe(cart);
    expect(api.cart.remove).toHaveBeenCalledWith('p1');
  });

  it('clears the whole cart', async () => {
    mock(api.cart.clear).mockResolvedValue({ cart });
    await expect(cartService.clear()).resolves.toBe(cart);
    expect(api.cart.clear).toHaveBeenCalled();
  });
});
