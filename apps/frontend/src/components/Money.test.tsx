import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Money } from './Money';

describe('Money', () => {
  it('converts cents to a major-unit currency string', () => {
    render(<Money amountInCents={123450} />);
    expect(screen.getByText(/1\.234,50/)).toBeInTheDocument();
  });

  it('defaults to ARS when no currency is given', () => {
    const { container } = render(<Money amountInCents={1000} />);
    expect(container.textContent).toMatch(/\$/);
  });

  it('honors an explicit currency', () => {
    const { container } = render(<Money amountInCents={500} currency="USD" />);
    expect(container.textContent).toMatch(/US\$|\$/);
  });

  it('renders zero correctly', () => {
    const { container } = render(<Money amountInCents={0} />);
    expect(container.textContent).toMatch(/0,00/);
  });

  it('wraps the value in the fo-money class', () => {
    const { container } = render(<Money amountInCents={100} />);
    expect(container.querySelector('.fo-money')).not.toBeNull();
  });
});
