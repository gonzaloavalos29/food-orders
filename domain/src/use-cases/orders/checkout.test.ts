import { CheckoutUseCase } from './checkout';
import { AddToCartUseCase } from '../cart/add-to-cart';
import { CreateProductUseCase } from '../products/create-product';
import { InMemoryProductRepository } from '../../__test-helpers__/in-memory-product-repository';
import { InMemoryCartRepository } from '../../__test-helpers__/in-memory-cart-repository';
import { InMemoryOrderRepository } from '../../__test-helpers__/in-memory-order-repository';
import { CounterIdGenerator } from '../../__test-helpers__/counter-id-generator';
import { FixedClock } from '../../__test-helpers__/fixed-clock';
import { User } from '../../entities';
import { Email } from '../../value-objects';
import { ValidationError } from '../../errors';

const admin = User.create({
  id: 'a', email: Email.create('a@a.com'), passwordHash: 'h', name: 'A', role: 'ADMIN', createdAt: new Date()
});
const customer = User.create({
  id: 'c', email: Email.create('c@c.com'), passwordHash: 'h', name: 'C', role: 'CUSTOMER', createdAt: new Date()
});

const setup = async () => {
  const products = new InMemoryProductRepository();
  const carts = new InMemoryCartRepository();
  const orders = new InMemoryOrderRepository();
  const clock = new FixedClock(new Date('2026-01-01T00:00:00Z'));
  const create = new CreateProductUseCase(products, new CounterIdGenerator('p'), clock);
  const add = new AddToCartUseCase(carts, products);
  const checkout = new CheckoutUseCase(carts, orders, products, new CounterIdGenerator('order'), clock);
  const pizza = await create.execute(admin, { name: 'Pizza', description: '', priceInCents: 5000, category: 'PIZZA', available: true });
  const coke = await create.execute(admin, { name: 'Coca', description: '', priceInCents: 1000, category: 'DRINK', available: true });
  return { products, carts, orders, add, checkout, pizza, coke };
};

describe('CheckoutUseCase', () => {
  it('creates an order from the cart and clears it', async () => {
    const { add, checkout, carts, orders, pizza, coke } = await setup();
    await add.execute(customer, { productId: pizza.id, quantity: 2 });
    await add.execute(customer, { productId: coke.id, quantity: 3 });

    const order = await checkout.execute(customer);

    expect(order.id).toBe('order-1');
    expect(order.userId).toBe(customer.id);
    expect(order.items).toHaveLength(2);
    expect(order.total.amountInCents).toBe(2 * 5000 + 3 * 1000);
    expect(order.status).toBe('PENDING');

    expect(await carts.findByUserId(customer.id)).toBeNull();
    expect(await orders.findById(order.id)).not.toBeNull();
  });

  it('fails when cart is empty', async () => {
    const { checkout } = await setup();
    await expect(checkout.execute(customer)).rejects.toBeInstanceOf(ValidationError);
  });

  it('fails when a product became unavailable before checkout', async () => {
    const { add, checkout, products, pizza } = await setup();
    await add.execute(customer, { productId: pizza.id, quantity: 1 });
    await products.save(pizza.changeAvailability(false));
    await expect(checkout.execute(customer)).rejects.toBeInstanceOf(ValidationError);
  });
});
