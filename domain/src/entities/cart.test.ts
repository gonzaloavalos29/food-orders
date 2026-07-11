import { Cart } from './cart';
import { Product } from './product';
import { Money } from '../value-objects';
import { ValidationError } from '../errors';

const makeProduct = (id: string, priceUnits: number, name = `Producto ${id}`) =>
  Product.create({
    id,
    name,
    description: '',
    price: Money.fromUnits(priceUnits),
    category: 'PIZZA',
    available: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01')
  });

describe('Cart', () => {
  it('starts empty', () => {
    const cart = Cart.empty('user-1');
    expect(cart.items).toEqual([]);
    expect(cart.total().amountInCents).toBe(0);
    expect(cart.isEmpty()).toBe(true);
  });

  it('adds a product', () => {
    const cart = Cart.empty('user-1');
    const p = makeProduct('p-1', 1000);
    const updated = cart.addItem(p, 2);
    expect(updated.items).toHaveLength(1);
    expect(updated.items[0].productId).toBe('p-1');
    expect(updated.items[0].quantity).toBe(2);
    expect(updated.total().amountInCents).toBe(200000);
  });

  it('increases quantity when adding the same product twice', () => {
    let cart = Cart.empty('user-1');
    const p = makeProduct('p-1', 500);
    cart = cart.addItem(p, 1);
    cart = cart.addItem(p, 2);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(3);
  });

  it('rejects zero or negative quantity', () => {
    const cart = Cart.empty('user-1');
    const p = makeProduct('p-1', 500);
    expect(() => cart.addItem(p, 0)).toThrow(ValidationError);
    expect(() => cart.addItem(p, -1)).toThrow(ValidationError);
  });

  it('rejects adding unavailable products', () => {
    const cart = Cart.empty('user-1');
    const p = makeProduct('p-1', 500).changeAvailability(false);
    expect(() => cart.addItem(p, 1)).toThrow(ValidationError);
  });

  it('removes a product', () => {
    let cart = Cart.empty('user-1');
    cart = cart.addItem(makeProduct('p-1', 500), 1);
    cart = cart.addItem(makeProduct('p-2', 700), 1);
    cart = cart.removeItem('p-1');
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].productId).toBe('p-2');
  });

  it('updates quantity of an existing item', () => {
    let cart = Cart.empty('user-1');
    const p = makeProduct('p-1', 1000);
    cart = cart.addItem(p, 1);
    cart = cart.updateQuantity('p-1', 5);
    expect(cart.items[0].quantity).toBe(5);
    expect(cart.total().amountInCents).toBe(500000);
  });

  it('removes the item when updateQuantity is set to 0', () => {
    let cart = Cart.empty('user-1');
    cart = cart.addItem(makeProduct('p-1', 500), 2);
    cart = cart.updateQuantity('p-1', 0);
    expect(cart.items).toHaveLength(0);
  });

  it('throws when updating quantity of missing item', () => {
    const cart = Cart.empty('user-1');
    expect(() => cart.updateQuantity('p-999', 3)).toThrow(ValidationError);
  });

  it('clears the cart', () => {
    let cart = Cart.empty('user-1');
    cart = cart.addItem(makeProduct('p-1', 500), 2);
    cart = cart.clear();
    expect(cart.isEmpty()).toBe(true);
  });

  it('computes the total across items', () => {
    let cart = Cart.empty('user-1');
    cart = cart.addItem(makeProduct('p-1', 1000), 2);
    cart = cart.addItem(makeProduct('p-2', 500), 3);
    expect(cart.total().amountInCents).toBe(350000);
  });

  it('rejects an empty userId', () => {
    expect(() => Cart.empty('')).toThrow(ValidationError);
    expect(() => Cart.empty('   ')).toThrow(ValidationError);
  });

  it('restores a cart from persisted items (clonando los items)', () => {
    const items = [
      { productId: 'p-1', productName: 'Pizza', unitPrice: Money.fromUnits(1000), quantity: 2 }
    ];
    const cart = Cart.restore('user-1', items);
    expect(cart.userId).toBe('user-1');
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).not.toBe(items[0]);
    expect(cart.total().amountInCents).toBe(200000);
  });

  it('rejects updating to a negative or non-integer quantity', () => {
    let cart = Cart.empty('user-1');
    cart = cart.addItem(makeProduct('p-1', 500), 1);
    expect(() => cart.updateQuantity('p-1', -1)).toThrow(ValidationError);
    expect(() => cart.updateQuantity('p-1', 1.5)).toThrow(ValidationError);
  });

  it('accumulates on an existing item leaving the others untouched', () => {
    let cart = Cart.empty('user-1');
    cart = cart.addItem(makeProduct('p-1', 500), 1);
    cart = cart.addItem(makeProduct('p-2', 700), 1);
    cart = cart.addItem(makeProduct('p-1', 500), 2);
    const p1 = cart.items.find(i => i.productId === 'p-1');
    const p2 = cart.items.find(i => i.productId === 'p-2');
    expect(p1?.quantity).toBe(3);
    expect(p2?.quantity).toBe(1);
  });

  it('updates one item leaving the others untouched', () => {
    let cart = Cart.empty('user-1');
    cart = cart.addItem(makeProduct('p-1', 500), 1);
    cart = cart.addItem(makeProduct('p-2', 700), 2);
    cart = cart.updateQuantity('p-1', 5);
    const p1 = cart.items.find(i => i.productId === 'p-1');
    const p2 = cart.items.find(i => i.productId === 'p-2');
    expect(p1?.quantity).toBe(5);
    expect(p2?.quantity).toBe(2);
  });
});
