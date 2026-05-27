import type { CartDto, OrderDto, OrderStatus, ProductCategory, ProductDto, UserDto } from './types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) {
    super(message);
  }
}

type Token = string | null;
let tokenGetter: () => Token = () => null;
export const setTokenGetter = (fn: () => Token) => { tokenGetter = fn; };

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined)
  };
  const token = tokenGetter();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = body?.error ?? { code: 'UNKNOWN', message: 'Unknown error' };
    throw new ApiError(res.status, err.code, err.message);
  }
  return body as T;
}

export const api = {
  auth: {
    register: (input: { email: string; password: string; name: string; role?: 'CUSTOMER' | 'STAFF' | 'ADMIN' }) =>
      request<{ user: UserDto }>('/api/auth/register', { method: 'POST', body: JSON.stringify(input) }),
    login: (input: { email: string; password: string }) =>
      request<{ user: UserDto; token: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify(input) }),
    me: () => request<{ user: UserDto }>('/api/auth/me')
  },
  products: {
    list: (params?: { category?: ProductCategory; includeUnavailable?: boolean }) => {
      const qs = new URLSearchParams();
      if (params?.category) qs.set('category', params.category);
      if (params?.includeUnavailable) qs.set('includeUnavailable', 'true');
      const suffix = qs.toString() ? `?${qs}` : '';
      return request<{ products: ProductDto[] }>(`/api/products${suffix}`);
    },
    get: (id: string) => request<{ product: ProductDto }>(`/api/products/${id}`),
    create: (input: Omit<ProductDto, 'id' | 'createdAt' | 'updatedAt' | 'currency'>) =>
      request<{ product: ProductDto }>('/api/products', { method: 'POST', body: JSON.stringify(input) }),
    update: (id: string, input: Partial<Omit<ProductDto, 'id' | 'createdAt' | 'updatedAt' | 'currency'>>) =>
      request<{ product: ProductDto }>(`/api/products/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    remove: (id: string) => request<void>(`/api/products/${id}`, { method: 'DELETE' })
  },
  cart: {
    get: () => request<{ cart: CartDto }>('/api/cart'),
    add: (input: { productId: string; quantity: number }) =>
      request<{ cart: CartDto }>('/api/cart/items', { method: 'POST', body: JSON.stringify(input) }),
    update: (productId: string, quantity: number) =>
      request<{ cart: CartDto }>(`/api/cart/items/${productId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
    remove: (productId: string) =>
      request<{ cart: CartDto }>(`/api/cart/items/${productId}`, { method: 'DELETE' }),
    clear: () => request<{ cart: CartDto }>('/api/cart', { method: 'DELETE' })
  },
  orders: {
    checkout: () => request<{ order: OrderDto }>('/api/orders/checkout', { method: 'POST' }),
    list: (status?: OrderStatus) =>
      request<{ orders: OrderDto[] }>(`/api/orders${status ? `?status=${status}` : ''}`),
    get: (id: string) => request<{ order: OrderDto }>(`/api/orders/${id}`),
    updateStatus: (id: string, status: OrderStatus) =>
      request<{ order: OrderDto }>(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    cancel: (id: string) => request<{ order: OrderDto }>(`/api/orders/${id}/cancel`, { method: 'POST' })
  }
};
