import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CartPage } from './CartPage';
import { makeCart, makeCartItem } from '../test/factories';

const h = vi.hoisted(() => ({
  navigate: vi.fn(),
  get: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  checkout: vi.fn()
}));

vi.mock('react-router-dom', async (orig) => {
  const actual = await orig<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => h.navigate };
});
vi.mock('../api/client', () => ({
  api: {
    cart: { get: h.get, update: h.update, remove: h.remove },
    orders: { checkout: h.checkout }
  }
}));

beforeEach(() => {
  vi.clearAllMocks();
  h.get.mockResolvedValue({ cart: makeCart() });
});

const setup = () => render(<MemoryRouter><CartPage /></MemoryRouter>);

describe('<CartPage>', () => {
  it('muestra "Cargando…" mientras no llega el carrito', () => {
    h.get.mockReturnValue(new Promise(() => {}));
    setup();
    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });

  it('muestra el estado vacío', async () => {
    h.get.mockResolvedValue({ cart: makeCart({ items: [] }) });
    setup();
    expect(await screen.findByText('Tu carrito está vacío.')).toBeInTheDocument();
  });

  it('sumar cantidad llama a cart.update', async () => {
    h.update.mockResolvedValue({ cart: makeCart({ items: [makeCartItem({ quantity: 3 })] }) });
    setup();
    await userEvent.click(await screen.findByRole('button', { name: 'Sumar uno' }));
    expect(h.update).toHaveBeenCalledWith('prod-1', 3);
  });

  it('bajar a 0 elimina el item (cart.remove)', async () => {
    h.get.mockResolvedValue({ cart: makeCart({ items: [makeCartItem({ quantity: 1 })] }) });
    h.remove.mockResolvedValue({ cart: makeCart({ items: [] }) });
    setup();
    await userEvent.click(await screen.findByRole('button', { name: 'Restar uno' }));
    expect(h.remove).toHaveBeenCalledWith('prod-1');
  });

  it('muestra error si actualizar falla', async () => {
    h.update.mockRejectedValue(new Error('límite alcanzado'));
    setup();
    await userEvent.click(await screen.findByRole('button', { name: 'Sumar uno' }));
    expect(await screen.findByText('límite alcanzado')).toBeInTheDocument();
  });

  it('quitar item llama a cart.remove', async () => {
    h.remove.mockResolvedValue({ cart: makeCart({ items: [] }) });
    setup();
    await userEvent.click(await screen.findByRole('button', { name: 'Quitar' }));
    expect(h.remove).toHaveBeenCalledWith('prod-1');
  });

  it('muestra error si quitar falla', async () => {
    h.remove.mockRejectedValue(new Error('no se pudo'));
    setup();
    await userEvent.click(await screen.findByRole('button', { name: 'Quitar' }));
    expect(await screen.findByText('no se pudo')).toBeInTheDocument();
  });

  it('checkout navega al detalle del pedido creado', async () => {
    h.checkout.mockResolvedValue({ order: { id: 'order-9' } });
    setup();
    await userEvent.click(await screen.findByRole('button', { name: 'Finalizar pedido' }));
    await waitFor(() => expect(h.navigate).toHaveBeenCalledWith('/orders/order-9'));
  });

  it('muestra error si el checkout falla', async () => {
    h.checkout.mockRejectedValue(new Error('carrito vacío'));
    setup();
    await userEvent.click(await screen.findByRole('button', { name: 'Finalizar pedido' }));
    expect(await screen.findByText('carrito vacío')).toBeInTheDocument();
  });
});
