import type { OrderDto, OrderStatus } from '../api/types';
import { Button } from './Button';
import { Money } from './Money';
import './OrderCard.css';

interface OrderCardProps {
  order: OrderDto;
  canManage?: boolean;
  canCancel?: boolean;
  onAdvance?: (next: OrderStatus) => void;
  onCancel?: () => void;
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'En preparación',
  READY: 'Listo',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado'
};

const NEXT_FROM: Record<OrderStatus, OrderStatus | null> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'DELIVERED',
  DELIVERED: null,
  CANCELLED: null
};

export function OrderCard({ order, canManage, canCancel, onAdvance, onCancel }: OrderCardProps) {
  const next = NEXT_FROM[order.status];
  return (
    <article className="fo-order" data-status={order.status}>
      <header className="fo-order__header">
        <span className="fo-order__id">#{order.id.slice(0, 8)}</span>
        <span className={`fo-order__status fo-order__status--${order.status.toLowerCase()}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </header>
      <ul className="fo-order__items">
        {order.items.map(i => (
          <li key={i.productId}>
            {i.quantity} × {i.productName}
            <span> — </span>
            <Money amountInCents={i.subtotalInCents} currency={i.currency} />
          </li>
        ))}
      </ul>
      <footer className="fo-order__footer">
        <strong>Total: <Money amountInCents={order.totalInCents} currency={order.items[0]?.currency ?? 'ARS'} /></strong>
        <div className="fo-order__actions">
          {canManage && next && onAdvance && (
            <Button size="sm" onClick={() => onAdvance(next)}>
              Avanzar a {STATUS_LABEL[next]}
            </Button>
          )}
          {canCancel && onCancel && (
            <Button size="sm" variant="danger" onClick={onCancel}>Cancelar</Button>
          )}
        </div>
      </footer>
    </article>
  );
}
