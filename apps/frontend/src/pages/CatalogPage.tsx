import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { ProductCategory, ProductDto } from '../api/types';
import { ProductCard } from '../components/ProductCard';
import { useAuth } from '../auth/AuthContext';
import './CatalogPage.css';

const CATEGORIES: { value: ProductCategory | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todo' },
  { value: 'PIZZA', label: 'Pizzas' },
  { value: 'BURGER', label: 'Hamburguesas' },
  { value: 'FRIES', label: 'Papas' },
  { value: 'DRINK', label: 'Bebidas' }
];

export function CatalogPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [category, setCategory] = useState<ProductCategory | 'ALL'>('ALL');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.products
      .list({ category: category === 'ALL' ? undefined : category })
      .then(r => setProducts(r.products))
      .catch(e => setError(e.message));
  }, [category]);

  const handleAdd = async (p: ProductDto) => {
    if (!user) { setError('Tenés que iniciar sesión para pedir.'); return; }
    try {
      await api.cart.add({ productId: p.id, quantity: 1 });
      setMessage(`Agregado: ${p.name}`);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="fo-catalog">
      <div className="fo-catalog__filters">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            className={`fo-tab ${category === c.value ? 'fo-tab--active' : ''}`}
            onClick={() => setCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>
      {message && <div className="fo-toast fo-toast--ok">{message}</div>}
      {error && <div className="fo-toast fo-toast--err">{error}</div>}
      <div className="fo-catalog__grid">
        {products.map(p => (
          <ProductCard key={p.id} product={p} onAdd={user ? handleAdd : undefined} />
        ))}
      </div>
    </div>
  );
}
