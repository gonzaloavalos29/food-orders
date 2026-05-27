import type { ProductDto } from '../api/types';
import { Button } from './Button';
import { Money } from './Money';
import './ProductCard.css';

interface ProductCardProps {
  product: ProductDto;
  onAdd?: (product: ProductDto) => void;
  disabled?: boolean;
}

const CATEGORY_LABEL: Record<ProductDto['category'], string> = {
  PIZZA: 'Pizza', BURGER: 'Hamburguesa', FRIES: 'Papas', DRINK: 'Bebida'
};

export function ProductCard({ product, onAdd, disabled }: ProductCardProps) {
  return (
    <article className={`fo-card ${!product.available ? 'fo-card--unavailable' : ''}`}>
      <header className="fo-card__header">
        <span className="fo-card__category">{CATEGORY_LABEL[product.category]}</span>
        <h3 className="fo-card__name">{product.name}</h3>
      </header>
      <p className="fo-card__description">{product.description}</p>
      <footer className="fo-card__footer">
        <Money amountInCents={product.priceInCents} currency={product.currency} />
        {onAdd && (
          <Button
            onClick={() => onAdd(product)}
            disabled={disabled || !product.available}
            size="sm"
          >
            {product.available ? 'Agregar' : 'No disponible'}
          </Button>
        )}
      </footer>
    </article>
  );
}
