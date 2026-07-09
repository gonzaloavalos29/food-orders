import { ClearCartUseCase } from './clear-cart';
import { InMemoryCartRepository } from '../../__test-helpers__/in-memory-cart-repository';
import { Cart, Product, User } from '../../entities';
import { Email, Money } from '../../value-objects';

const customer = User.create({
  id: 'c', email: Email.create('c@c.com'), passwordHash: 'h', name: 'C', role: 'CUSTOMER', createdAt: new Date()
});

const product = Product.create({
  id: 'p-1', name: 'Pizza', description: '', price: Money.fromCents(5000),
  category: 'PIZZA', available: true, createdAt: new Date(), updatedAt: new Date()
});

describe('ClearCartUseCase', () => {
  it('devuelve un carrito vacío', async () => {
    const carts = new InMemoryCartRepository();
    const clear = new ClearCartUseCase(carts);
    const cart = await clear.execute(customer);
    expect(cart.isEmpty()).toBe(true);
  });

  it('persiste el carrito vacío pisando el anterior', async () => {
    const carts = new InMemoryCartRepository();
    await carts.save(Cart.empty(customer.id).addItem(product, 3));
    const clear = new ClearCartUseCase(carts);
    await clear.execute(customer);
    const stored = await carts.findByUserId(customer.id);
    expect(stored?.isEmpty()).toBe(true);
  });
});
