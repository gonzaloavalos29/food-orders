import { render, screen } from '@testing-library/react';
import { App } from './App';
import type { UserDto } from './api/types';

const h = vi.hoisted(() => ({ user: null as UserDto | null }));

vi.mock('./auth/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({ user: h.user, login: vi.fn(), register: vi.fn(), logout: vi.fn() })
}));

vi.mock('./api/client', () => ({
  setTokenGetter: vi.fn(),
  api: {
    products: { list: vi.fn().mockResolvedValue({ products: [] }) },
    cart: { get: vi.fn().mockResolvedValue({ cart: { userId: 'u1', items: [], totalInCents: 0 } }) },
    orders: { list: vi.fn().mockResolvedValue({ orders: [] }) }
  }
}));

const user = (over: Partial<UserDto> = {}): UserDto => ({
  id: 'u1', email: 'a@b.c', name: 'A', role: 'CUSTOMER', createdAt: '', ...over
});

const go = (path: string) => window.history.pushState({}, '', path);

beforeEach(() => {
  vi.clearAllMocks();
  h.user = null;
  go('/');
});

describe('<App> ruteo y guardas', () => {
  it('ruta protegida sin sesión redirige a /login', async () => {
    go('/cart');
    render(<App />);
    expect(await screen.findByText('Iniciar sesión')).toBeInTheDocument();
  });

  it('ruta con rol insuficiente redirige al catálogo', async () => {
    h.user = user({ role: 'CUSTOMER' });
    go('/admin');
    render(<App />);
    expect(await screen.findByRole('button', { name: 'Todo' })).toBeInTheDocument();
  });

  it('ruta con rol adecuado renderiza la página protegida', async () => {
    h.user = user({ role: 'ADMIN' });
    go('/admin');
    render(<App />);
    expect(await screen.findByText('Administración de productos')).toBeInTheDocument();
  });

  it('ruta protegida sin restricción de rol renderiza para el usuario logueado', async () => {
    h.user = user();
    go('/cart');
    render(<App />);
    expect(await screen.findByText('Tu carrito está vacío.')).toBeInTheDocument();
  });

  it('ruta desconocida redirige al catálogo', async () => {
    go('/no-existe');
    render(<App />);
    expect(await screen.findByRole('button', { name: 'Todo' })).toBeInTheDocument();
  });
});
