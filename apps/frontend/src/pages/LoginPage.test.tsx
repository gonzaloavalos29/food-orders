import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';

const h = vi.hoisted(() => ({ navigate: vi.fn(), login: vi.fn() }));

vi.mock('react-router-dom', async (orig) => {
  const actual = await orig<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => h.navigate };
});
vi.mock('../auth/AuthContext', () => ({ useAuth: () => ({ login: h.login }) }));

beforeEach(() => vi.clearAllMocks());

const setup = () => render(<MemoryRouter><LoginPage /></MemoryRouter>);
const fill = async () => {
  await userEvent.type(screen.getByLabelText(/email/i), 'ada@food.local');
  await userEvent.type(screen.getByLabelText(/contraseña/i), 'pw12345678');
};

describe('<LoginPage>', () => {
  it('loguea y navega al home', async () => {
    h.login.mockResolvedValue(undefined);
    setup();
    await fill();
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(h.login).toHaveBeenCalledWith('ada@food.local', 'pw12345678');
    await waitFor(() => expect(h.navigate).toHaveBeenCalledWith('/'));
  });

  it('muestra el mensaje de error y no navega si falla', async () => {
    h.login.mockRejectedValue(new Error('Credenciales inválidas'));
    setup();
    await fill();
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument();
    expect(h.navigate).not.toHaveBeenCalled();
  });

  it('deshabilita el botón y muestra "Entrando…" mientras envía', async () => {
    let resolve!: () => void;
    h.login.mockReturnValue(new Promise<void>((r) => { resolve = r; }));
    setup();
    await fill();
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    const btn = screen.getByRole('button', { name: 'Entrando…' });
    expect(btn).toBeDisabled();
    resolve();
    await waitFor(() => expect(h.navigate).toHaveBeenCalled());
  });
});
