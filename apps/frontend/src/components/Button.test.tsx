import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('applies default variant and size classes', () => {
    render(<Button>Click</Button>);
    const btn = screen.getByRole('button', { name: 'Click' });
    expect(btn).toHaveClass('fo-btn', 'fo-btn--primary', 'fo-btn--md');
  });

  it('applies the requested variant and size', () => {
    render(<Button variant="danger" size="lg">Borrar</Button>);
    const btn = screen.getByRole('button', { name: 'Borrar' });
    expect(btn).toHaveClass('fo-btn--danger', 'fo-btn--lg');
  });

  it('merges a custom className', () => {
    render(<Button className="extra">X</Button>);
    expect(screen.getByRole('button')).toHaveClass('extra');
  });

  it('fires onClick when pressed', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
