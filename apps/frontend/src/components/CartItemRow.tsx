import type { CartItemDto } from '../api/types';
import { Button } from './Button';
import { Money } from './Money';
import './CartItemRow.css';

interface CartItemRowProps {
  item: CartItemDto;
  onQuantityChange?: (productId: string, quantity: number) => void;
  onRemove?: (productId: string) => void;
}

export function CartItemRow({ item, onQuantityChange, onRemove }: CartItemRowProps) {
  return (
    <div className="fo-row" data-testid={`cart-row-${item.productId}`}>
      <div className="fo-row__name">{item.productName}</div>
      <div className="fo-row__qty">
        {onQuantityChange ? (
          <>
            <Button size="sm" variant="secondary"
              onClick={() => onQuantityChange(item.productId, Math.max(0, item.quantity - 1))}
              aria-label="Restar uno">-</Button>
            <span className="fo-row__qtyval">{item.quantity}</span>
            <Button size="sm" variant="secondary"
              onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
              aria-label="Sumar uno">+</Button>
          </>
        ) : (
          <span className="fo-row__qtyval">x{item.quantity}</span>
        )}
      </div>
      <div className="fo-row__price"><Money amountInCents={item.subtotalInCents} currency={item.currency} /></div>
      {onRemove && (
        <Button size="sm" variant="danger" onClick={() => onRemove(item.productId)}>Quitar</Button>
      )}
    </div>
  );
}
