import { Product, ProductCategory } from './product';
import { Money } from '../value-objects';
import { ValidationError } from '../errors';

describe('Product', () => {
  const baseProps = {
    id: 'p-1',
    name: 'Pizza Muzzarella',
    description: 'Clásica con queso muzzarella',
    price: Money.fromUnits(5000),
    category: 'PIZZA' as ProductCategory,
    available: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01')
  };

  it('creates a product', () => {
    const p = Product.create(baseProps);
    expect(p.id).toBe('p-1');
    expect(p.name).toBe('Pizza Muzzarella');
    expect(p.price.amountInCents).toBe(500000);
    expect(p.category).toBe('PIZZA');
    expect(p.available).toBe(true);
  });

  it('rejects empty name', () => {
    expect(() => Product.create({ ...baseProps, name: ' ' })).toThrow(ValidationError);
  });

  it('rejects price of zero', () => {
    expect(() =>
      Product.create({ ...baseProps, price: Money.zero() })
    ).toThrow(ValidationError);
  });

  it('rejects invalid category', () => {
    expect(() =>
      Product.create({ ...baseProps, category: 'SUSHI' as ProductCategory })
    ).toThrow(ValidationError);
  });

  it('changes availability', () => {
    const p = Product.create(baseProps);
    const updated = p.changeAvailability(false);
    expect(updated.available).toBe(false);
    expect(p.available).toBe(true);
  });

  it('updates fields with update()', () => {
    const p = Product.create(baseProps);
    const updated = p.update({ name: 'Pizza Especial', price: Money.fromUnits(7000) });
    expect(updated.name).toBe('Pizza Especial');
    expect(updated.price.amountInCents).toBe(700000);
    expect(updated.description).toBe(baseProps.description);
  });

  it('keeps id when updating', () => {
    const p = Product.create(baseProps);
    const updated = p.update({ name: 'Otra' });
    expect(updated.id).toBe(p.id);
  });

  it('rejects empty id', () => {
    expect(() => Product.create({ ...baseProps, id: '  ' })).toThrow(ValidationError);
  });

  it('exposes description, createdAt and updatedAt', () => {
    const p = Product.create(baseProps);
    expect(p.description).toBe(baseProps.description);
    expect(p.createdAt).toEqual(baseProps.createdAt);
    expect(p.updatedAt).toEqual(baseProps.updatedAt);
  });

  it('defaults description to an empty string when not provided', () => {
    const p = Product.create({ ...baseProps, description: undefined as unknown as string });
    expect(p.description).toBe('');
  });

  it('update() keeps the current name when it is not provided', () => {
    const p = Product.create(baseProps);
    const updated = p.update({ available: false });
    expect(updated.name).toBe(baseProps.name);
    expect(updated.available).toBe(false);
  });

  it('update() applies every provided field', () => {
    const p = Product.create(baseProps);
    const updated = p.update({
      name: 'Pizza XL',
      description: 'Extra grande',
      price: Money.fromUnits(9000),
      category: 'BURGER',
      available: false
    });
    expect(updated.name).toBe('Pizza XL');
    expect(updated.description).toBe('Extra grande');
    expect(updated.price.amountInCents).toBe(900000);
    expect(updated.category).toBe('BURGER');
    expect(updated.available).toBe(false);
  });
});
