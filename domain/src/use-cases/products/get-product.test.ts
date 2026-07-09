import { GetProductUseCase } from './get-product';
import { InMemoryProductRepository } from '../../__test-helpers__/in-memory-product-repository';
import { Product } from '../../entities';
import { Money } from '../../value-objects';
import { NotFoundError } from '../../errors';

const setup = async () => {
  const products = new InMemoryProductRepository();
  await products.save(Product.create({
    id: 'p-1', name: 'Pizza', description: '', price: Money.fromCents(5000),
    category: 'PIZZA', available: true, createdAt: new Date(), updatedAt: new Date()
  }));
  return { get: new GetProductUseCase(products) };
};

describe('GetProductUseCase', () => {
  it('devuelve el producto cuando existe', async () => {
    const { get } = await setup();
    const product = await get.execute('p-1');
    expect(product.id).toBe('p-1');
    expect(product.name).toBe('Pizza');
  });

  it('lanza NotFoundError cuando no existe', async () => {
    const { get } = await setup();
    await expect(get.execute('nope')).rejects.toBeInstanceOf(NotFoundError);
  });
});
