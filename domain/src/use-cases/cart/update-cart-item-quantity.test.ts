import { UpdateCartItemQuantityUseCase } from './update-cart-item-quantity';
import { InMemoryCartRepository } from '../../__test-helpers__/in-memory-cart-repository';
import { Cart, Product, User } from '../../entities';
import { Email, Money } from '../../value-objects';
import { NotFoundError } from '../../errors';

const customer = User.create({
  id: 'c', email: Email.create('c@c.com'), passwordHash: 'h', name: 'C', role: 'CUSTOMER', createdAt: new Date()
});

const product = Product.create({
  id: 'p-1', name: 'Pizza', description: '', price: Money.fromCents(5000),
  category: 'PIZZA', available: true, createdAt: new Date(), updatedAt: new Date()
});

describe('UpdateCartItemQuantityUseCase', () => {
  it('actualiza la cantidad de un item existente', async () => {
    const carts = new InMemoryCartRepository();
    await carts.save(Cart.empty(customer.id).addItem(product, 1));
    const update = new UpdateCartItemQuantityUseCase(carts);
    const updated = await update.execute(customer, { productId: 'p-1', quantity: 5 });
    expect(updated.items[0].quantity).toBe(5);
    const stored = await carts.findByUserId(customer.id);
    expect(stored?.items[0].quantity).toBe(5);
  });

  it('lanza NotFoundError cuando el carrito no existe', async () => {
    const carts = new InMemoryCartRepository();
    const update = new UpdateCartItemQuantityUseCase(carts);
    await expect(
      update.execute(customer, { productId: 'p-1', quantity: 2 })
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
