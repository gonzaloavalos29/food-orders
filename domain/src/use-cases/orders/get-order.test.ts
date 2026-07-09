import { GetOrderUseCase } from './get-order';
import { InMemoryOrderRepository } from '../../__test-helpers__/in-memory-order-repository';
import { Order, User } from '../../entities';
import { Email, Money } from '../../value-objects';
import { AuthorizationError, NotFoundError } from '../../errors';

const owner = User.create({
  id: 'owner', email: Email.create('o@o.com'), passwordHash: 'h', name: 'O', role: 'CUSTOMER', createdAt: new Date()
});
const otherCustomer = User.create({
  id: 'other', email: Email.create('x@x.com'), passwordHash: 'h', name: 'X', role: 'CUSTOMER', createdAt: new Date()
});
const staff = User.create({
  id: 'staff', email: Email.create('s@s.com'), passwordHash: 'h', name: 'S', role: 'STAFF', createdAt: new Date()
});

const setup = async () => {
  const orders = new InMemoryOrderRepository();
  await orders.save(Order.create({
    id: 'o-1', userId: owner.id,
    items: [{ productId: 'p-1', productName: 'Pizza', unitPrice: Money.fromCents(5000), quantity: 1 }],
    status: 'PENDING', createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01')
  }));
  return { orders, getOrder: new GetOrderUseCase(orders) };
};

describe('GetOrderUseCase', () => {
  it('lanza NotFoundError cuando el pedido no existe', async () => {
    const { getOrder } = await setup();
    await expect(getOrder.execute(owner, 'nope')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('el dueño puede ver su pedido', async () => {
    const { getOrder } = await setup();
    const order = await getOrder.execute(owner, 'o-1');
    expect(order.id).toBe('o-1');
  });

  it('el staff puede ver el pedido de otro', async () => {
    const { getOrder } = await setup();
    const order = await getOrder.execute(staff, 'o-1');
    expect(order.id).toBe('o-1');
  });

  it('otro cliente no puede ver un pedido ajeno', async () => {
    const { getOrder } = await setup();
    await expect(getOrder.execute(otherCustomer, 'o-1')).rejects.toBeInstanceOf(AuthorizationError);
  });
});
