import { UpdateOrderStatusUseCase } from './update-order-status';
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
import { AuthorizationError, NotFoundError, ValidationError } from '../../errors';

const admin = User.create({ id: 'a', email: Email.create('a@a.com'), passwordHash: 'h', name: 'A', role: 'ADMIN', createdAt: new Date() });
const staff = User.create({ id: 's', email: Email.create('s@s.com'), passwordHash: 'h', name: 'S', role: 'STAFF', createdAt: new Date() });
const customer = User.create({ id: 'c', email: Email.create('c@c.com'), passwordHash: 'h', name: 'C', role: 'CUSTOMER', createdAt: new Date() });

const setup = async () => {
  const products = new InMemoryProductRepository();
  const carts = new InMemoryCartRepository();
  const orders = new InMemoryOrderRepository();
  const clock = new FixedClock(new Date('2026-01-01T00:00:00Z'));
  const create = new CreateProductUseCase(products, new CounterIdGenerator('p'), clock);
  const add = new AddToCartUseCase(carts, products);
  const checkout = new CheckoutUseCase(carts, orders, products, new CounterIdGenerator('order'), clock);
  const update = new UpdateOrderStatusUseCase(orders);
  const pizza = await create.execute(admin, { name: 'Pizza', description: '', priceInCents: 5000, category: 'PIZZA', available: true });
  await add.execute(customer, { productId: pizza.id, quantity: 1 });
  const order = await checkout.execute(customer);
  return { update, order, orders };
};

describe('UpdateOrderStatusUseCase', () => {
  it('staff can confirm an order', async () => {
    const { update, order } = await setup();
    const updated = await update.execute(staff, { orderId: order.id, nextStatus: 'CONFIRMED' });
    expect(updated.status).toBe('CONFIRMED');
  });

  it('customer cannot update status', async () => {
    const { update, order } = await setup();
    await expect(
      update.execute(customer, { orderId: order.id, nextStatus: 'CONFIRMED' })
    ).rejects.toBeInstanceOf(AuthorizationError);
  });

  it('rejects invalid transitions', async () => {
    const { update, order } = await setup();
    await expect(
      update.execute(admin, { orderId: order.id, nextStatus: 'DELIVERED' })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('throws NotFoundError when the order does not exist', async () => {
    const { update } = await setup();
    await expect(
      update.execute(staff, { orderId: 'nope', nextStatus: 'CONFIRMED' })
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
