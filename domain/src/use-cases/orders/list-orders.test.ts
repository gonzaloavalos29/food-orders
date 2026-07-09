import { ListOrdersUseCase } from './list-orders';
import { InMemoryOrderRepository } from '../../__test-helpers__/in-memory-order-repository';
import { Order, OrderStatus, User } from '../../entities';
import { Email, Money } from '../../value-objects';

const customer = User.create({
  id: 'c', email: Email.create('c@c.com'), passwordHash: 'h', name: 'C', role: 'CUSTOMER', createdAt: new Date()
});
const staff = User.create({
  id: 's', email: Email.create('s@s.com'), passwordHash: 'h', name: 'S', role: 'STAFF', createdAt: new Date()
});

const makeOrder = (id: string, userId: string, status: OrderStatus) => Order.create({
  id, userId,
  items: [{ productId: 'p-1', productName: 'Pizza', unitPrice: Money.fromCents(5000), quantity: 1 }],
  status, createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01')
});

const setup = async () => {
  const orders = new InMemoryOrderRepository();
  await orders.save(makeOrder('o-1', customer.id, 'PENDING'));
  await orders.save(makeOrder('o-2', 'someone-else', 'CONFIRMED'));
  await orders.save(makeOrder('o-3', customer.id, 'CONFIRMED'));
  return { orders, list: new ListOrdersUseCase(orders) };
};

describe('ListOrdersUseCase', () => {
  it('el staff ve todos los pedidos', async () => {
    const { list } = await setup();
    const result = await list.execute(staff);
    expect(result).toHaveLength(3);
  });

  it('el cliente solo ve sus propios pedidos', async () => {
    const { list } = await setup();
    const result = await list.execute(customer);
    expect(result).toHaveLength(2);
    expect(result.every(o => o.userId === customer.id)).toBe(true);
  });

  it('el staff puede filtrar por estado', async () => {
    const { list } = await setup();
    const result = await list.execute(staff, { status: 'CONFIRMED' });
    expect(result).toHaveLength(2);
    expect(result.every(o => o.status === 'CONFIRMED')).toBe(true);
  });

  it('el cliente filtra por estado dentro de los suyos', async () => {
    const { list } = await setup();
    const result = await list.execute(customer, { status: 'CONFIRMED' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('o-3');
  });
});
