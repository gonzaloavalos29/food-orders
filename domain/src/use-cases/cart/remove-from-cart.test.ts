import { RemoveFromCartUseCase } from './remove-from-cart';
import { InMemoryCartRepository } from '../../__test-helpers__/in-memory-cart-repository';
import { Cart, Product, User } from '../../entities';
import { Email, Money } from '../../value-objects';

const customer = User.create({
  id: 'c', email: Email.create('c@c.com'), passwordHash: 'h', name: 'C', role: 'CUSTOMER', createdAt: new Date()
});

const makeProduct = (id: string) => Product.create({
  id, name: `Prod ${id}`, description: '', price: Money.fromCents(5000),
  category: 'PIZZA', available: true, createdAt: new Date(), updatedAt: new Date()
});

describe('RemoveFromCartUseCase', () => {
  it('quita un item del carrito existente', async () => {
    const carts = new InMemoryCartRepository();
    const cart = Cart.empty(customer.id).addItem(makeProduct('p-1'), 1).addItem(makeProduct('p-2'), 1);
    await carts.save(cart);
    const remove = new RemoveFromCartUseCase(carts);
    const updated = await remove.execute(customer, 'p-1');
    expect(updated.items).toHaveLength(1);
    expect(updated.items[0].productId).toBe('p-2');
  });

  it('sobre un carrito inexistente devuelve uno vacío (no falla)', async () => {
    const carts = new InMemoryCartRepository();
    const remove = new RemoveFromCartUseCase(carts);
    const updated = await remove.execute(customer, 'p-1');
    expect(updated.isEmpty()).toBe(true);
  });
});
