import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from './ProductCard';
import type { ProductDto } from '../api/types';

const product: ProductDto = {
  id: 'p1',
  name: 'Hamburguesa Clásica',
  description: 'Carne, queso y huevo',
  priceInCents: 8000,
  currency: 'ARS',
  category: 'BURGER',
  available: true,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01'
};

describe('ProductCard', () => {
  it('renders name, description, translated category and price', () => {
    render(<ProductCard product={product} />);
    expect(screen.getByText('Hamburguesa Clásica')).toBeInTheDocument();
    expect(screen.getByText('Carne, queso y huevo')).toBeInTheDocument();
    expect(screen.getByText('Hamburguesa')).toBeInTheDocument();
    expect(screen.getByText(/80,00/)).toBeInTheDocument();
  });

  it('calls onAdd with the product when available', async () => {
    const onAdd = vi.fn();
    render(<ProductCard product={product} onAdd={onAdd} />);
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    expect(onAdd).toHaveBeenCalledWith(product);
  });

  it('disables the add button and changes the label when unavailable', () => {
    const onAdd = vi.fn();
    render(<ProductCard product={{ ...product, available: false }} onAdd={onAdd} />);
    const btn = screen.getByRole('button', { name: 'No disponible' });
    expect(btn).toBeDisabled();
  });

  it('hides the add button when no onAdd is provided', () => {
    render(<ProductCard product={product} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
