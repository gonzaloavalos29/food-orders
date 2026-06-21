import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartItemRow } from './CartItemRow';
import type { CartItemDto } from '../api/types';

const item: CartItemDto = {
  productId: 'p1',
  productName: 'Pizza Muzza',
  unitPriceInCents: 5000,
  currency: 'ARS',
  quantity: 2,
  subtotalInCents: 10000
};

describe('CartItemRow', () => {
  it('renders the product name and subtotal', () => {
    render(<CartItemRow item={item} />);
    expect(screen.getByText('Pizza Muzza')).toBeInTheDocument();
    expect(screen.getByText(/100,00/)).toBeInTheDocument();
  });

  it('shows read-only quantity when no onQuantityChange is given', () => {
    render(<CartItemRow item={item} />);
    expect(screen.getByText('x2')).toBeInTheDocument();
    expect(screen.queryByLabelText('Sumar uno')).not.toBeInTheDocument();
  });

  it('increments quantity through the + control', async () => {
    const onQuantityChange = vi.fn();
    render(<CartItemRow item={item} onQuantityChange={onQuantityChange} />);
    await userEvent.click(screen.getByLabelText('Sumar uno'));
    expect(onQuantityChange).toHaveBeenCalledWith('p1', 3);
  });

  it('decrements quantity but never below zero', async () => {
    const onQuantityChange = vi.fn();
    render(<CartItemRow item={{ ...item, quantity: 0 }} onQuantityChange={onQuantityChange} />);
    await userEvent.click(screen.getByLabelText('Restar uno'));
    expect(onQuantityChange).toHaveBeenCalledWith('p1', 0);
  });

  it('calls onRemove with the product id', async () => {
    const onRemove = vi.fn();
    render(<CartItemRow item={item} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: 'Quitar' }));
    expect(onRemove).toHaveBeenCalledWith('p1');
  });
});
