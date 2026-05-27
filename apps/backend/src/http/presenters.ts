import { Cart, Order, Product, User } from '@food-orders/domain';

export const presentUser = (u: User) => ({
  id: u.id,
  email: u.email.value,
  name: u.name,
  role: u.role,
  createdAt: u.createdAt.toISOString()
});

export const presentProduct = (p: Product) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  priceInCents: p.price.amountInCents,
  currency: p.price.currency,
  category: p.category,
  available: p.available,
  createdAt: p.createdAt.toISOString(),
  updatedAt: p.updatedAt.toISOString()
});

export const presentCart = (c: Cart) => ({
  userId: c.userId,
  items: c.items.map(i => ({
    productId: i.productId,
    productName: i.productName,
    unitPriceInCents: i.unitPrice.amountInCents,
    currency: i.unitPrice.currency,
    quantity: i.quantity,
    subtotalInCents: i.unitPrice.amountInCents * i.quantity
  })),
  totalInCents: c.total().amountInCents
});

export const presentOrder = (o: Order) => ({
  id: o.id,
  userId: o.userId,
  status: o.status,
  items: o.items.map(i => ({
    productId: i.productId,
    productName: i.productName,
    unitPriceInCents: i.unitPrice.amountInCents,
    currency: i.unitPrice.currency,
    quantity: i.quantity,
    subtotalInCents: i.unitPrice.amountInCents * i.quantity
  })),
  totalInCents: o.total.amountInCents,
  createdAt: o.createdAt.toISOString(),
  updatedAt: o.updatedAt.toISOString()
});
