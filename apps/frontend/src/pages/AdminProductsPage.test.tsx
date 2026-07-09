import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminProductsPage } from './AdminProductsPage';
import { makeProduct } from '../test/factories';

const h = vi.hoisted(() => ({
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn()
}));

vi.mock('../api/client', () => ({
  api: { products: { list: h.list, create: h.create, update: h.update, remove: h.remove } }
}));

beforeEach(() => {
  vi.clearAllMocks();
  h.list.mockResolvedValue({
    products: [
      makeProduct({ id: 'p1', name: 'Muzzarella', available: true }),
      makeProduct({ id: 'p2', name: 'Fugazzeta', available: false })
    ]
  });
});

describe('<AdminProductsPage>', () => {
  it('lista productos incluyendo los no disponibles', async () => {
    render(<AdminProductsPage />);
    expect(await screen.findByText('Muzzarella')).toBeInTheDocument();
    expect(screen.getByText('Fugazzeta')).toBeInTheDocument();
    expect(h.list).toHaveBeenCalledWith({ includeUnavailable: true });
    // marcadores de disponibilidad
    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('muestra error si falla la carga', async () => {
    h.list.mockRejectedValue(new Error('backend caído'));
    render(<AdminProductsPage />);
    expect(await screen.findByText('backend caído')).toBeInTheDocument();
  });

  it('crea un producto con los datos del formulario', async () => {
    h.create.mockResolvedValue({ product: makeProduct() });
    render(<AdminProductsPage />);
    await screen.findByText('Muzzarella');

    await userEvent.type(screen.getByLabelText('Nombre'), 'Napolitana');
    await userEvent.type(screen.getByLabelText('Descripción'), 'con tomate');
    const precio = screen.getByLabelText(/Precio/);
    await userEvent.clear(precio);
    await userEvent.type(precio, '750000');
    await userEvent.selectOptions(screen.getByLabelText('Categoría'), 'BURGER');
    await userEvent.click(screen.getByRole('button', { name: 'Crear' }));

    expect(h.create).toHaveBeenCalledWith({
      name: 'Napolitana',
      description: 'con tomate',
      priceInCents: 750000,
      category: 'BURGER',
      available: true
    });
  });

  it('muestra error si crear falla', async () => {
    h.create.mockRejectedValue(new Error('precio inválido'));
    render(<AdminProductsPage />);
    await screen.findByText('Muzzarella');
    await userEvent.type(screen.getByLabelText('Nombre'), 'X');
    await userEvent.click(screen.getByRole('button', { name: 'Crear' }));
    expect(await screen.findByText('precio inválido')).toBeInTheDocument();
  });

  it('pausa un producto disponible (toggle a no disponible)', async () => {
    h.update.mockResolvedValue({ product: makeProduct() });
    render(<AdminProductsPage />);
    const row = (await screen.findByText('Muzzarella')).closest('tr')!;
    await userEvent.click(within(row).getByRole('button', { name: 'Pausar' }));
    expect(h.update).toHaveBeenCalledWith('p1', { available: false });
  });

  it('activa un producto no disponible', async () => {
    h.update.mockResolvedValue({ product: makeProduct() });
    render(<AdminProductsPage />);
    const row = (await screen.findByText('Fugazzeta')).closest('tr')!;
    await userEvent.click(within(row).getByRole('button', { name: 'Activar' }));
    expect(h.update).toHaveBeenCalledWith('p2', { available: true });
  });

  it('muestra error si el toggle falla', async () => {
    h.update.mockRejectedValue(new Error('no se pudo actualizar'));
    render(<AdminProductsPage />);
    const row = (await screen.findByText('Muzzarella')).closest('tr')!;
    await userEvent.click(within(row).getByRole('button', { name: 'Pausar' }));
    expect(await screen.findByText('no se pudo actualizar')).toBeInTheDocument();
  });

  it('borra un producto tras confirmar', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    h.remove.mockResolvedValue(undefined);
    render(<AdminProductsPage />);
    const row = (await screen.findByText('Muzzarella')).closest('tr')!;
    await userEvent.click(within(row).getByRole('button', { name: 'Borrar' }));
    expect(h.remove).toHaveBeenCalledWith('p1');
  });

  it('no borra si se cancela la confirmación', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<AdminProductsPage />);
    const row = (await screen.findByText('Muzzarella')).closest('tr')!;
    await userEvent.click(within(row).getByRole('button', { name: 'Borrar' }));
    expect(h.remove).not.toHaveBeenCalled();
  });

  it('muestra error si borrar falla', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    h.remove.mockRejectedValue(new Error('no se pudo borrar'));
    render(<AdminProductsPage />);
    const row = (await screen.findByText('Muzzarella')).closest('tr')!;
    await userEvent.click(within(row).getByRole('button', { name: 'Borrar' }));
    expect(await screen.findByText('no se pudo borrar')).toBeInTheDocument();
  });
});
