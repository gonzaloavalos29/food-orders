import { AddToCartUseCase } from './add-to-cart';
import { CreateProductUseCase } from '../products/create-product';
import { InMemoryProductRepository } from '../../__test-helpers__/in-memory-product-repository';
import { InMemoryCartRepository } from '../../__test-helpers__/in-memory-cart-repository';
import { CounterIdGenerator } from '../../__test-helpers__/counter-id-generator';
import { FixedClock } from '../../__test-helpers__/fixed-clock';
import { User } from '../../entities';
import { Email } from '../../value-objects';
import { NotFoundError, ValidationError } from '../../errors';

const admin = User.create({
  id: 'a', email: Email.create('a@a.com'), passwordHash: 'h', name: 'A', role: 'ADMIN', createdAt: new Date()
});
const customer = User.create({
  id: 'c', email: Email.create('c@c.com'), passwordHash: 'h', name: 'C', role: 'CUSTOMER', createdAt: new Date()
});

const setup = async () => {
  const products = new InMemoryProductRepository();
  const carts = new InMemoryCartRepository();
  const create = new CreateProductUseCase(products, new CounterIdGenerator('p'), new FixedClock(new Date()));
  const p1 = await create.execute(admin, { name: 'Pizza', description: '', priceInCents: 5000, category: 'PIZZA', available: true });
  const add = new AddToCartUseCase(carts, products);
  return { add, carts, p1 };
};

describe('AddToCartUseCase', () => {
  it('adds a product to a new cart', async () => {
    const { add, p1 } = await setup();
    const cart = await add.execute(customer, { productId: p1.id, quantity: 2 });
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);
  });

  it('throws when product does not exist', async () => {
    const { add } = await setup();
    await expect(add.execute(customer, { productId: 'nope', quantity: 1 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rejects non-positive quantity', async () => {
    const { add, p1 } = await setup();
    await expect(add.execute(customer, { productId: p1.id, quantity: 0 })).rejects.toBeInstanceOf(ValidationError);
  });

  it('accumulates quantities when adding twice', async () => {
    const { add, p1 } = await setup();
    await add.execute(customer, { productId: p1.id, quantity: 1 });
    const cart = await add.execute(customer, { productId: p1.id, quantity: 2 });
    expect(cart.items[0].quantity).toBe(3);
  });
});
