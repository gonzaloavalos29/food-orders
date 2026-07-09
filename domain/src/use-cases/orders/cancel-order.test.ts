import { CancelOrderUseCase } from './cancel-order';
import { InMemoryOrderRepository } from '../../__test-helpers__/in-memory-order-repository';
import { Order, OrderStatus, User } from '../../entities';
import { Email, Money } from '../../value-objects';
import { AuthorizationError, NotFoundError, ValidationError } from '../../errors';

const owner = User.create({
  id: 'owner', email: Email.create('o@o.com'), passwordHash: 'h', name: 'O', role: 'CUSTOMER', createdAt: new Date()
});
const otherCustomer = User.create({
  id: 'other', email: Email.create('x@x.com'), passwordHash: 'h', name: 'X', role: 'CUSTOMER', createdAt: new Date()
});
const staff = User.create({
  id: 'staff', email: Email.create('s@s.com'), passwordHash: 'h', name: 'S', role: 'STAFF', createdAt: new Date()
});

const makeOrder = (status: OrderStatus, userId = owner.id) => Order.create({
  id: 'o-1', userId,
  items: [{ productId: 'p-1', productName: 'Pizza', unitPrice: Money.fromCents(5000), quantity: 1 }],
  status, createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01')
});

const setup = async (status: OrderStatus = 'PENDING') => {
  const orders = new InMemoryOrderRepository();
  await orders.save(makeOrder(status));
  return { orders, cancel: new CancelOrderUseCase(orders) };
};

describe('CancelOrderUseCase', () => {
  it('lanza NotFoundError cuando el pedido no existe', async () => {
    const { cancel } = await setup();
    await expect(cancel.execute(owner, 'nope')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('el dueño puede cancelar un pedido PENDING', async () => {
    const { cancel } = await setup('PENDING');
    const cancelled = await cancel.execute(owner, 'o-1');
    expect(cancelled.status).toBe('CANCELLED');
  });

  it('otro cliente que no es dueño no puede cancelar', async () => {
    const { cancel } = await setup('PENDING');
    await expect(cancel.execute(otherCustomer, 'o-1')).rejects.toBeInstanceOf(AuthorizationError);
  });

  it('el dueño no puede cancelar un pedido ya en preparación', async () => {
    const { cancel } = await setup('PREPARING');
    await expect(cancel.execute(owner, 'o-1')).rejects.toBeInstanceOf(ValidationError);
  });

  it('el staff puede cancelar aunque no sea el dueño', async () => {
    const { cancel } = await setup('CONFIRMED');
    const cancelled = await cancel.execute(staff, 'o-1');
    expect(cancelled.status).toBe('CANCELLED');
  });
});
