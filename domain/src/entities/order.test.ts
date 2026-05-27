import { Order, OrderItem, OrderStatus } from './order';
import { Money } from '../value-objects';
import { ValidationError } from '../errors';

const sampleItems = (): OrderItem[] => [
  {
    productId: 'p-1',
    productName: 'Pizza Muzzarella',
    unitPrice: Money.fromUnits(5000),
    quantity: 2
  },
  {
    productId: 'p-2',
    productName: 'Coca-Cola 500ml',
    unitPrice: Money.fromUnits(800),
    quantity: 3
  }
];

const baseProps = () => ({
  id: 'o-1',
  userId: 'user-1',
  items: sampleItems(),
  status: 'PENDING' as OrderStatus,
  createdAt: new Date('2026-01-01T10:00:00Z'),
  updatedAt: new Date('2026-01-01T10:00:00Z')
});

describe('Order', () => {
  describe('creation', () => {
    it('creates an order with computed total', () => {
      const o = Order.create(baseProps());
      // 5000 * 2 + 800 * 3 = 12400
      expect(o.total.amountInCents).toBe(1240000);
      expect(o.status).toBe('PENDING');
    });

    it('rejects empty items', () => {
      expect(() => Order.create({ ...baseProps(), items: [] })).toThrow(ValidationError);
    });

    it('rejects items with quantity <= 0', () => {
      const bad = [{ ...sampleItems()[0], quantity: 0 }];
      expect(() => Order.create({ ...baseProps(), items: bad })).toThrow(ValidationError);
    });

    it('rejects missing userId', () => {
      expect(() => Order.create({ ...baseProps(), userId: '' })).toThrow(ValidationError);
    });
  });

  describe('status transitions', () => {
    const transitions: Array<[OrderStatus, OrderStatus, boolean]> = [
      ['PENDING', 'CONFIRMED', true],
      ['PENDING', 'CANCELLED', true],
      ['PENDING', 'PREPARING', false],
      ['CONFIRMED', 'PREPARING', true],
      ['CONFIRMED', 'CANCELLED', true],
      ['CONFIRMED', 'DELIVERED', false],
      ['PREPARING', 'READY', true],
      ['PREPARING', 'CANCELLED', false],
      ['READY', 'DELIVERED', true],
      ['DELIVERED', 'CANCELLED', false],
      ['CANCELLED', 'CONFIRMED', false]
    ];

    transitions.forEach(([from, to, ok]) => {
      it(`${from} -> ${to} is ${ok ? 'allowed' : 'rejected'}`, () => {
        const o = Order.create({ ...baseProps(), status: from });
        if (ok) {
          const updated = o.transitionTo(to);
          expect(updated.status).toBe(to);
          expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(o.updatedAt.getTime());
        } else {
          expect(() => o.transitionTo(to)).toThrow(ValidationError);
        }
      });
    });
  });

  describe('cancel by customer', () => {
    it('can be cancelled if PENDING or CONFIRMED', () => {
      const pending = Order.create({ ...baseProps(), status: 'PENDING' });
      const confirmed = Order.create({ ...baseProps(), status: 'CONFIRMED' });
      expect(pending.canBeCancelledByCustomer()).toBe(true);
      expect(confirmed.canBeCancelledByCustomer()).toBe(true);
    });

    it('cannot be cancelled once it is PREPARING or beyond', () => {
      const preparing = Order.create({ ...baseProps(), status: 'PREPARING' });
      const ready = Order.create({ ...baseProps(), status: 'READY' });
      const delivered = Order.create({ ...baseProps(), status: 'DELIVERED' });
      expect(preparing.canBeCancelledByCustomer()).toBe(false);
      expect(ready.canBeCancelledByCustomer()).toBe(false);
      expect(delivered.canBeCancelledByCustomer()).toBe(false);
    });
  });
});
