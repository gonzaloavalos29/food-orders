import { ListProductsUseCase } from './list-products';
import { CreateProductUseCase } from './create-product';
import { InMemoryProductRepository } from '../../__test-helpers__/in-memory-product-repository';
import { CounterIdGenerator } from '../../__test-helpers__/counter-id-generator';
import { FixedClock } from '../../__test-helpers__/fixed-clock';
import { User } from '../../entities';
import { Email } from '../../value-objects';

const admin = User.create({
  id: 'a', email: Email.create('a@a.com'), passwordHash: 'h', name: 'A', role: 'ADMIN', createdAt: new Date()
});
const customer = User.create({
  id: 'c', email: Email.create('c@c.com'), passwordHash: 'h', name: 'C', role: 'CUSTOMER', createdAt: new Date()
});

const setup = async () => {
  const products = new InMemoryProductRepository();
  const create = new CreateProductUseCase(products, new CounterIdGenerator('p'), new FixedClock(new Date()));
  await create.execute(admin, { name: 'Pizza', description: '', priceInCents: 5000, category: 'PIZZA', available: true });
  await create.execute(admin, { name: 'Burger', description: '', priceInCents: 4000, category: 'BURGER', available: true });
  await create.execute(admin, { name: 'Coca', description: '', priceInCents: 1000, category: 'DRINK', available: false });
  const list = new ListProductsUseCase(products);
  return { list };
};

describe('ListProductsUseCase', () => {
  it('returns only available products for guests/customers', async () => {
    const { list } = await setup();
    const result = await list.execute(null);
    expect(result).toHaveLength(2);
    expect(result.every(p => p.available)).toBe(true);
  });

  it('returns all products for admin', async () => {
    const { list } = await setup();
    const result = await list.execute(admin);
    expect(result).toHaveLength(3);
  });

  it('filters by category', async () => {
    const { list } = await setup();
    const result = await list.execute(customer, { category: 'PIZZA' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Pizza');
  });
});
