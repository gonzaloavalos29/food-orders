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
    expect(p.available).toBe(true); // immutability
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
});
