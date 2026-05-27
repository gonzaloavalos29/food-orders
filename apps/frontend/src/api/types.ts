export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';
export type ProductCategory = 'PIZZA' | 'BURGER' | 'FRIES' | 'DRINK';
export type OrderStatus =
  | 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  currency: string;
  category: ProductCategory;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItemDto {
  productId: string;
  productName: string;
  unitPriceInCents: number;
  currency: string;
  quantity: number;
  subtotalInCents: number;
}

export interface CartDto {
  userId: string;
  items: CartItemDto[];
  totalInCents: number;
}

export interface OrderItemDto extends CartItemDto {}

export interface OrderDto {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItemDto[];
  totalInCents: number;
  createdAt: string;
  updatedAt: string;
}
