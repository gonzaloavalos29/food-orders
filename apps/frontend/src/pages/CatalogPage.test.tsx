import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CatalogPage } from './CatalogPage';
import { makeProduct, makeUser } from '../test/factories';
import type { UserDto } from '../api/types';

const h = vi.hoisted(() => ({
  user: null as UserDto | null,
  list: vi.fn(),
  add: vi.fn()
}));

vi.mock('../api/client', () => ({ api: { products: { list: h.list }, cart: { add: h.add } } }));
vi.mock('../auth/AuthContext', () => ({ useAuth: () => ({ user: h.user }) }));

beforeEach(() => {
  vi.clearAllMocks();
  h.user = null;
  h.list.mockResolvedValue({ products: [makeProduct()] });
});

describe('<CatalogPage>', () => {
  it('lista los productos', async () => {
    h.list.mockResolvedValue({ products: [makeProduct(), makeProduct({ id: 'p2', name: 'Napolitana' })] });
    render(<CatalogPage />);
    expect(await screen.findByText('Muzzarella')).toBeInTheDocument();
    expect(screen.getByText('Napolitana')).toBeInTheDocument();
  });

  it('muestra error si falla la carga', async () => {
    h.list.mockRejectedValue(new Error('backend caído'));
    render(<CatalogPage />);
    expect(await screen.findByText('backend caído')).toBeInTheDocument();
  });

  it('cambiar de categoría vuelve a pedir con el filtro', async () => {
    render(<CatalogPage />);
    await screen.findByText('Muzzarella');
    expect(h.list).toHaveBeenCalledWith({ category: undefined });
    await userEvent.click(screen.getByRole('button', { name: 'Pizzas' }));
    await waitFor(() => expect(h.list).toHaveBeenCalledWith({ category: 'PIZZA' }));
  });

  it('sin sesión, las tarjetas no ofrecen "Agregar"', async () => {
    render(<CatalogPage />);
    await screen.findByText('Muzzarella');
    expect(screen.queryByRole('button', { name: 'Agregar' })).toBeNull();
  });

  it('con sesión, agregar al carrito muestra confirmación', async () => {
    h.user = makeUser();
    h.add.mockResolvedValue({ cart: { items: [] } });
    render(<CatalogPage />);
    await userEvent.click(await screen.findByRole('button', { name: 'Agregar' }));
    expect(h.add).toHaveBeenCalledWith({ productId: 'prod-1', quantity: 1 });
    expect(await screen.findByText('Agregado: Muzzarella')).toBeInTheDocument();
  });

  it('con sesión, muestra error si agregar falla', async () => {
    h.user = makeUser();
    h.add.mockRejectedValue(new Error('sin stock'));
    render(<CatalogPage />);
    await userEvent.click(await screen.findByRole('button', { name: 'Agregar' }));
    expect(await screen.findByText('sin stock')).toBeInTheDocument();
  });
});
