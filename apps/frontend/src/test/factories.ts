import type { CartDto, CartItemDto, OrderDto, ProductDto, UserDto } from '../api/types';

export function makeUser(overrides: Partial<UserDto> = {}): UserDto {
  return {
    id: 'user-1',
    email: 'ada@food.local',
    name: 'Ada',
    role: 'CUSTOMER',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides
  };
}

export function makeProduct(overrides: Partial<ProductDto> = {}): ProductDto {
  return {
    id: 'prod-1',
    name: 'Muzzarella',
    description: 'La clásica',
    priceInCents: 500000,
    currency: 'ARS',
    category: 'PIZZA',
    available: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides
  };
}

export function makeCartItem(overrides: Partial<CartItemDto> = {}): CartItemDto {
  return {
    productId: 'prod-1',
    productName: 'Muzzarella',
    unitPriceInCents: 500000,
    currency: 'ARS',
    quantity: 2,
    subtotalInCents: 1000000,
    ...overrides
  };
}

export function makeCart(overrides: Partial<CartDto> = {}): CartDto {
  const items = overrides.items ?? [makeCartItem()];
  return {
    userId: 'user-1',
    items,
    totalInCents: items.reduce((acc, i) => acc + i.subtotalInCents, 0),
    ...overrides
  };
}

export function makeOrder(overrides: Partial<OrderDto> = {}): OrderDto {
  const items = overrides.items ?? [makeCartItem()];
  return {
    id: 'order-abcdef123456',
    userId: 'user-1',
    status: 'PENDING',
    items,
    totalInCents: items.reduce((acc, i) => acc + i.subtotalInCents, 0),
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides
  };
}
