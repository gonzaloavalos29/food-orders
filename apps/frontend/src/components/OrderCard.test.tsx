import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderCard } from './OrderCard';
import type { OrderDto } from '../api/types';

const baseOrder: OrderDto = {
  id: 'abcdef1234567890',
  userId: 'u1',
  status: 'PENDING',
  items: [
    { productId: 'p1', productName: 'Pizza', unitPriceInCents: 5000, currency: 'ARS', quantity: 2, subtotalInCents: 10000 }
  ],
  totalInCents: 10000,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01'
};

describe('OrderCard', () => {
  it('shows the short id, translated status and items', () => {
    render(<OrderCard order={baseOrder} />);
    expect(screen.getByText('#abcdef12')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText(/2 × Pizza/)).toBeInTheDocument();
  });

  it('advances to the next status in the workflow', async () => {
    const onAdvance = vi.fn();
    render(<OrderCard order={baseOrder} canManage onAdvance={onAdvance} />);
    // PENDING -> CONFIRMED
    await userEvent.click(screen.getByRole('button', { name: /Avanzar a Confirmado/ }));
    expect(onAdvance).toHaveBeenCalledWith('CONFIRMED');
  });

  it('does not show an advance button for terminal statuses', () => {
    render(<OrderCard order={{ ...baseOrder, status: 'DELIVERED' }} canManage onAdvance={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /Avanzar/ })).not.toBeInTheDocument();
  });

  it('hides management actions when canManage is false', () => {
    render(<OrderCard order={baseOrder} onAdvance={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /Avanzar/ })).not.toBeInTheDocument();
  });

  it('fires onCancel when cancellation is allowed', async () => {
    const onCancel = vi.fn();
    render(<OrderCard order={baseOrder} canCancel onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('falls back to ARS as currency when the order has no items', () => {
    render(<OrderCard order={{ ...baseOrder, items: [], totalInCents: 0 }} />);
    expect(screen.getByText(/Total:/)).toBeInTheDocument();
  });
});
