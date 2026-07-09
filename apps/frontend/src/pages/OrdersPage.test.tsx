import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { OrdersPage } from './OrdersPage';
import { makeOrder, makeUser } from '../test/factories';
import type { UserDto } from '../api/types';

const h = vi.hoisted(() => ({
  user: null as UserDto | null,
  list: vi.fn(),
  updateStatus: vi.fn(),
  cancel: vi.fn()
}));

vi.mock('../api/client', () => ({
  api: { orders: { list: h.list, updateStatus: h.updateStatus, cancel: h.cancel } }
}));
vi.mock('../auth/AuthContext', () => ({ useAuth: () => ({ user: h.user }) }));

beforeEach(() => {
  vi.clearAllMocks();
  h.user = makeUser();
  h.list.mockResolvedValue({ orders: [makeOrder()] });
});

const setup = (kitchen = false) =>
  render(<MemoryRouter><OrdersPage kitchen={kitchen} /></MemoryRouter>);

describe('<OrdersPage>', () => {
  it('muestra "No hay pedidos" cuando la lista está vacía', async () => {
    h.list.mockResolvedValue({ orders: [] });
    setup();
    expect(await screen.findByText('No hay pedidos.')).toBeInTheDocument();
  });

  it('muestra error si falla la carga', async () => {
    h.list.mockRejectedValue(new Error('sin conexión'));
    setup();
    expect(await screen.findByText('sin conexión')).toBeInTheDocument();
  });

  it('modo cocina filtra los pedidos ya entregados/cancelados', async () => {
    h.list.mockResolvedValue({
      orders: [makeOrder({ id: 'act-1', status: 'PENDING' }), makeOrder({ id: 'done-1', status: 'DELIVERED' })]
    });
    setup(true);
    expect(await screen.findByText('Pendiente')).toBeInTheDocument();
    expect(screen.queryByText('Entregado')).toBeNull();
  });

  it('el cliente dueño puede cancelar su pedido pendiente', async () => {
    h.user = makeUser({ id: 'user-1', role: 'CUSTOMER' });
    h.list.mockResolvedValue({ orders: [makeOrder({ userId: 'user-1', status: 'PENDING' })] });
    h.cancel.mockResolvedValue({});
    setup();
    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));
    expect(h.cancel).toHaveBeenCalledWith('order-abcdef123456');
    await waitFor(() => expect(h.list).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('button', { name: /Avanzar/ })).toBeNull();
  });

  it('el cliente dueño también puede cancelar un pedido confirmado', async () => {
    h.user = makeUser({ id: 'user-1', role: 'CUSTOMER' });
    h.list.mockResolvedValue({ orders: [makeOrder({ userId: 'user-1', status: 'CONFIRMED' })] });
    setup();
    expect(await screen.findByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('el staff puede avanzar el estado', async () => {
    h.user = makeUser({ id: 'staff-1', role: 'STAFF' });
    h.list.mockResolvedValue({ orders: [makeOrder({ userId: 'user-1', status: 'PENDING' })] });
    h.updateStatus.mockResolvedValue({});
    setup();
    await userEvent.click(await screen.findByRole('button', { name: 'Avanzar a Confirmado' }));
    expect(h.updateStatus).toHaveBeenCalledWith('order-abcdef123456', 'CONFIRMED');
    await waitFor(() => expect(h.list).toHaveBeenCalledTimes(2));
  });

  it('el admin también gestiona', async () => {
    h.user = makeUser({ id: 'admin-1', role: 'ADMIN' });
    setup();
    expect(await screen.findByRole('button', { name: /Avanzar/ })).toBeInTheDocument();
  });

  it('muestra error si avanzar falla', async () => {
    h.user = makeUser({ id: 'staff-1', role: 'STAFF' });
    h.updateStatus.mockRejectedValue(new Error('transición inválida'));
    setup();
    await userEvent.click(await screen.findByRole('button', { name: /Avanzar/ }));
    expect(await screen.findByText('transición inválida')).toBeInTheDocument();
  });

  it('muestra error si cancelar falla', async () => {
    h.user = makeUser({ id: 'user-1', role: 'CUSTOMER' });
    h.list.mockResolvedValue({ orders: [makeOrder({ userId: 'user-1', status: 'PENDING' })] });
    h.cancel.mockRejectedValue(new Error('no cancelable'));
    setup();
    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));
    expect(await screen.findByText('no cancelable')).toBeInTheDocument();
  });

  it('sin usuario no ofrece acciones', async () => {
    h.user = null;
    setup();
    await screen.findByText('Pendiente');
    expect(screen.queryByRole('button')).toBeNull();
  });
});
