import { UpdateProductUseCase } from './update-product';
import { CreateProductUseCase } from './create-product';
import { InMemoryProductRepository } from '../../__test-helpers__/in-memory-product-repository';
import { CounterIdGenerator } from '../../__test-helpers__/counter-id-generator';
import { FixedClock } from '../../__test-helpers__/fixed-clock';
import { User } from '../../entities';
import { Email } from '../../value-objects';
import { AuthorizationError, NotFoundError } from '../../errors';

const admin = User.create({
  id: 'a', email: Email.create('a@a.com'), passwordHash: 'h', name: 'A', role: 'ADMIN', createdAt: new Date()
});
const customer = User.create({
  id: 'c', email: Email.create('c@c.com'), passwordHash: 'h', name: 'C', role: 'CUSTOMER', createdAt: new Date()
});

const setup = async () => {
  const products = new InMemoryProductRepository();
  const create = new CreateProductUseCase(products, new CounterIdGenerator('p'), new FixedClock(new Date()));
  const update = new UpdateProductUseCase(products);
  const created = await create.execute(admin, {
    name: 'Original', description: '', priceInCents: 1000, category: 'PIZZA', available: true
  });
  return { products, update, created };
};

describe('UpdateProductUseCase', () => {
  it('updates a product when admin', async () => {
    const { update, created } = await setup();
    const updated = await update.execute(admin, { id: created.id, name: 'Nuevo', priceInCents: 2000 });
    expect(updated.name).toBe('Nuevo');
    expect(updated.price.amountInCents).toBe(2000);
  });

  it('rejects when not admin', async () => {
    const { update, created } = await setup();
    await expect(update.execute(customer, { id: created.id, name: 'X' })).rejects.toBeInstanceOf(AuthorizationError);
  });

  it('throws when product does not exist', async () => {
    const { update } = await setup();
    await expect(update.execute(admin, { id: 'nope', name: 'X' })).rejects.toBeInstanceOf(NotFoundError);
  });
});
