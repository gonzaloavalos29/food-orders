import { DeleteProductUseCase } from './delete-product';
import { InMemoryProductRepository } from '../../__test-helpers__/in-memory-product-repository';
import { Product, User } from '../../entities';
import { Email, Money } from '../../value-objects';
import { AuthorizationError, NotFoundError } from '../../errors';

const admin = User.create({
  id: 'a', email: Email.create('a@a.com'), passwordHash: 'h', name: 'A', role: 'ADMIN', createdAt: new Date()
});
const customer = User.create({
  id: 'c', email: Email.create('c@c.com'), passwordHash: 'h', name: 'C', role: 'CUSTOMER', createdAt: new Date()
});

const setup = async () => {
  const products = new InMemoryProductRepository();
  await products.save(Product.create({
    id: 'p-1', name: 'Pizza', description: '', price: Money.fromCents(5000),
    category: 'PIZZA', available: true, createdAt: new Date(), updatedAt: new Date()
  }));
  return { products, remove: new DeleteProductUseCase(products) };
};

describe('DeleteProductUseCase', () => {
  it('un cliente no puede borrar productos', async () => {
    const { remove } = await setup();
    await expect(remove.execute(customer, 'p-1')).rejects.toBeInstanceOf(AuthorizationError);
  });

  it('lanza NotFoundError si el producto no existe', async () => {
    const { remove } = await setup();
    await expect(remove.execute(admin, 'nope')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('el admin borra un producto existente', async () => {
    const { products, remove } = await setup();
    await remove.execute(admin, 'p-1');
    expect(await products.findById('p-1')).toBeNull();
  });
});
