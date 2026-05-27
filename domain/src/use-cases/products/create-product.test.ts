import { CreateProductUseCase } from './create-product';
import { InMemoryProductRepository } from '../../__test-helpers__/in-memory-product-repository';
import { CounterIdGenerator } from '../../__test-helpers__/counter-id-generator';
import { FixedClock } from '../../__test-helpers__/fixed-clock';
import { User } from '../../entities';
import { Email } from '../../value-objects';
import { AuthorizationError, ValidationError } from '../../errors';

const makeUser = (role: 'CUSTOMER' | 'STAFF' | 'ADMIN') =>
  User.create({
    id: 'u-1',
    email: Email.create('x@x.com'),
    passwordHash: 'h',
    name: 'X',
    role,
    createdAt: new Date()
  });

const setup = () => {
  const products = new InMemoryProductRepository();
  const ids = new CounterIdGenerator('prod');
  const clock = new FixedClock(new Date('2026-01-01T00:00:00Z'));
  const uc = new CreateProductUseCase(products, ids, clock);
  return { products, uc };
};

describe('CreateProductUseCase', () => {
  it('creates a product when called by an admin', async () => {
    const { uc, products } = setup();
    const product = await uc.execute(makeUser('ADMIN'), {
      name: 'Pizza Muzza',
      description: 'Rica',
      priceInCents: 500000,
      category: 'PIZZA',
      available: true
    });
    expect(product.id).toBe('prod-1');
    expect(product.name).toBe('Pizza Muzza');
    expect(product.price.amountInCents).toBe(500000);
    expect(await products.findById('prod-1')).not.toBeNull();
  });

  it('rejects when called by a customer', async () => {
    const { uc } = setup();
    await expect(
      uc.execute(makeUser('CUSTOMER'), {
        name: 'X', description: '', priceInCents: 1000, category: 'PIZZA', available: true
      })
    ).rejects.toBeInstanceOf(AuthorizationError);
  });

  it('rejects when called by a staff', async () => {
    const { uc } = setup();
    await expect(
      uc.execute(makeUser('STAFF'), {
        name: 'X', description: '', priceInCents: 1000, category: 'PIZZA', available: true
      })
    ).rejects.toBeInstanceOf(AuthorizationError);
  });

  it('rejects invalid price (<=0)', async () => {
    const { uc } = setup();
    await expect(
      uc.execute(makeUser('ADMIN'), {
        name: 'X', description: '', priceInCents: 0, category: 'PIZZA', available: true
      })
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
