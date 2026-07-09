import { GetCartUseCase } from './get-cart';
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

describe('GetCartUseCase', () => {
  it('devuelve un carrito vacío cuando el usuario no tiene uno guardado', async () => {
    const carts = new InMemoryCartRepository();
    const getCart = new GetCartUseCase(carts);
    const cart = await getCart.execute(customer);
    expect(cart.isEmpty()).toBe(true);
    expect(cart.userId).toBe(customer.id);
  });

  it('devuelve el carrito guardado cuando existe', async () => {
    const carts = new InMemoryCartRepository();
    await carts.save(Cart.empty(customer.id).addItem(product, 2));
    const getCart = new GetCartUseCase(carts);
    const cart = await getCart.execute(customer);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);
  });
});
