import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from './Navbar';
import { makeUser } from '../test/factories';
import type { UserDto } from '../api/types';

const h = vi.hoisted(() => ({ user: null as UserDto | null, logout: vi.fn() }));
vi.mock('../auth/AuthContext', () => ({ useAuth: () => ({ user: h.user, logout: h.logout }) }));

beforeEach(() => {
  vi.clearAllMocks();
  h.user = null;
});

const setup = () => render(<MemoryRouter><Navbar /></MemoryRouter>);

describe('<Navbar>', () => {
  it('anónimo: muestra Login y Registrarse, oculta secciones privadas', () => {
    setup();
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Registrarse' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Carrito' })).toBeNull();
  });

  it('cliente: muestra Carrito y Mis pedidos, oculta Cocina/Admin, y Salir desloguea', async () => {
    h.user = makeUser();
    setup();
    expect(screen.getByRole('link', { name: 'Carrito' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mis pedidos' })).toBeInTheDocument();
    expect(screen.getByText('Ada (CUSTOMER)')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Cocina' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Admin' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Salir' }));
    expect(h.logout).toHaveBeenCalledTimes(1);
  });

  it('staff: muestra el enlace Cocina', () => {
    h.user = makeUser({ role: 'STAFF' });
    setup();
    expect(screen.getByRole('link', { name: 'Cocina' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Admin' })).toBeNull();
  });

  it('admin: muestra el enlace Admin', () => {
    h.user = makeUser({ role: 'ADMIN' });
    setup();
    expect(screen.getByRole('link', { name: 'Admin' })).toBeInTheDocument();
  });
});
