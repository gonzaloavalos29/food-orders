import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OrderDetailPage } from './OrderDetailPage';
import { makeOrder, makeUser } from '../test/factories';
import type { UserDto } from '../api/types';

const h = vi.hoisted(() => ({
  user: null as UserDto | null,
  get: vi.fn(),
  updateStatus: vi.fn(),
  cancel: vi.fn()
}));

vi.mock('../api/client', () => ({
  api: { orders: { get: h.get, updateStatus: h.updateStatus, cancel: h.cancel } }
}));
vi.mock('../auth/AuthContext', () => ({ useAuth: () => ({ user: h.user }) }));

beforeEach(() => {
  vi.clearAllMocks();
  h.user = null;
  h.get.mockResolvedValue({ order: makeOrder({ userId: 'user-1', status: 'PENDING' }) });
});

const setup = (path = '/orders/order-abcdef123456') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/orders" element={<OrderDetailPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('<OrderDetailPage>', () => {
  it('muestra "Cargando…" y luego el pedido', async () => {
    setup();
    expect(screen.getByText('Cargando…')).toBeInTheDocument();
    expect(await screen.findByText('Pendiente')).toBeInTheDocument();
  });

  it('muestra error si falla la carga', async () => {
    h.get.mockRejectedValue(new Error('pedido inexistente'));
    setup();
    expect(await screen.findByText('pedido inexistente')).toBeInTheDocument();
  });

  it('sin id en la ruta no consulta la API', async () => {
    setup('/orders');
    expect(screen.getByText('Cargando…')).toBeInTheDocument();
    expect(h.get).not.toHaveBeenCalled();
  });

  it('el staff puede avanzar el estado', async () => {
    h.user = makeUser({ id: 'staff-1', role: 'STAFF' });
    h.updateStatus.mockResolvedValue({});
    setup();
    await userEvent.click(await screen.findByRole('button', { name: 'Avanzar a Confirmado' }));
    expect(h.updateStatus).toHaveBeenCalledWith('order-abcdef123456', 'CONFIRMED');
    await waitFor(() => expect(h.get).toHaveBeenCalledTimes(2));
  });

  it('el admin también puede gestionar', async () => {
    h.user = makeUser({ id: 'admin-1', role: 'ADMIN' });
    setup();
    expect(await screen.findByRole('button', { name: /Avanzar/ })).toBeInTheDocument();
  });

  it('el dueño puede cancelar', async () => {
    h.user = makeUser({ id: 'user-1', role: 'CUSTOMER' });
    h.cancel.mockResolvedValue({});
    setup();
    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));
    expect(h.cancel).toHaveBeenCalledWith('order-abcdef123456');
    await waitFor(() => expect(h.get).toHaveBeenCalledTimes(2));
  });

  it('el dueño puede cancelar un pedido confirmado', async () => {
    h.user = makeUser({ id: 'user-1', role: 'CUSTOMER' });
    h.get.mockResolvedValue({ order: makeOrder({ userId: 'user-1', status: 'CONFIRMED' }) });
    setup();
    expect(await screen.findByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
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
    h.cancel.mockRejectedValue(new Error('no cancelable'));
    setup();
    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));
    expect(await screen.findByText('no cancelable')).toBeInTheDocument();
  });
});
