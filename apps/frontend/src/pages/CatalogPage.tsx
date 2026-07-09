import { useEffect, useState } from 'react';
import type { ProductCategory, ProductDto } from '../api/types';
import { productsService } from '../services/productsService';
import { cartService } from '../services/cartService';
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
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    productsService
      .list(category)
      .then(setProducts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [category]);

  const handleAdd = async (p: ProductDto) => {
    /* v8 ignore next 2 -- guarda defensiva: onAdd solo se conecta cuando hay usuario */
    if (!user) { setError('Tenés que iniciar sesión para pedir.'); return; }
    setAdding(p.id);
    try {
      await cartService.add(p.id, 1);
      setMessage(`Agregado: ${p.name}`);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAdding(null);
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
      {loading ? (
        <div className="fo-catalog__status" role="status">Cargando productos…</div>
      ) : products.length === 0 ? (
        <div className="fo-catalog__status">No hay productos en esta categoría.</div>
      ) : (
        <div className="fo-catalog__grid">
          {products.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onAdd={user ? handleAdd : undefined}
              disabled={adding === p.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
