import { api } from '../api/client';
import type { CartDto } from '../api/types';

export const cartService = {
  get: (): Promise<CartDto> => api.cart.get().then(r => r.cart),

  add: (productId: string, quantity = 1): Promise<CartDto> =>
    api.cart.add({ productId, quantity }).then(r => r.cart),

  changeQuantity: (productId: string, quantity: number): Promise<CartDto> =>
    (quantity <= 0
      ? api.cart.remove(productId)
      : api.cart.update(productId, quantity)
    ).then(r => r.cart),

  remove: (productId: string): Promise<CartDto> =>
    api.cart.remove(productId).then(r => r.cart),

  clear: (): Promise<CartDto> => api.cart.clear().then(r => r.cart)
};
