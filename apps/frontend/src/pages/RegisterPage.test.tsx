import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';

const h = vi.hoisted(() => ({ navigate: vi.fn(), register: vi.fn() }));

vi.mock('react-router-dom', async (orig) => {
  const actual = await orig<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => h.navigate };
});
vi.mock('../auth/AuthContext', () => ({ useAuth: () => ({ register: h.register }) }));

beforeEach(() => vi.clearAllMocks());

const setup = () => render(<MemoryRouter><RegisterPage /></MemoryRouter>);
const fill = async () => {
  await userEvent.type(screen.getByLabelText(/nombre/i), 'Neo');
  await userEvent.type(screen.getByLabelText(/email/i), 'neo@food.local');
  await userEvent.type(screen.getByLabelText(/contraseña/i), 'pw12345678');
};

describe('<RegisterPage>', () => {
  it('registra y navega al home', async () => {
    h.register.mockResolvedValue(undefined);
    setup();
    await fill();
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(h.register).toHaveBeenCalledWith({ email: 'neo@food.local', password: 'pw12345678', name: 'Neo' });
    await waitFor(() => expect(h.navigate).toHaveBeenCalledWith('/'));
  });

  it('muestra el error si el registro falla', async () => {
    h.register.mockRejectedValue(new Error('Email ya registrado'));
    setup();
    await fill();
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(await screen.findByText('Email ya registrado')).toBeInTheDocument();
    expect(h.navigate).not.toHaveBeenCalled();
  });
});
