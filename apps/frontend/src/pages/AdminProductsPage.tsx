import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { ProductCategory, ProductDto } from '../api/types';
import { Button } from '../components/Button';
import { Money } from '../components/Money';

const CATEGORIES: ProductCategory[] = ['PIZZA', 'BURGER', 'FRIES', 'DRINK'];

export function AdminProductsPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', priceInCents: 100000, category: 'PIZZA' as ProductCategory, available: true });

  const refresh = () =>
    api.products.list({ includeUnavailable: true })
      .then(r => setProducts(r.products))
      .catch(e => setError(e.message));
  useEffect(() => { refresh(); }, []);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.products.create(form);
      setForm({ name: '', description: '', priceInCents: 100000, category: 'PIZZA', available: true });
      await refresh();
    } catch (err) { setError((err as Error).message); }
  };

  const toggle = async (p: ProductDto) => {
    try { await api.products.update(p.id, { available: !p.available }); await refresh(); }
    catch (err) { setError((err as Error).message); }
  };

  const remove = async (p: ProductDto) => {
    if (!confirm(`¿Eliminar ${p.name}?`)) return;
    try { await api.products.remove(p.id); await refresh(); }
    catch (err) { setError((err as Error).message); }
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <h2>Administración de productos</h2>
      {error && <div className="fo-toast fo-toast--err">{error}</div>}
      <form onSubmit={create} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 20, alignItems: 'end' }}>
        <label>Nombre<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
        <label>Descripción<input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
        <label>Precio (en centavos)
          <input type="number" min={1} required value={form.priceInCents}
            onChange={e => setForm({ ...form, priceInCents: Number(e.target.value) })} />
        </label>
        <label>Categoría
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as ProductCategory })}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <Button type="submit">Crear</Button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left' }}>
            <th>Nombre</th><th>Categoría</th><th>Precio</th><th>Disponible</th><th></th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td><Money amountInCents={p.priceInCents} currency={p.currency} /></td>
              <td>{p.available ? '✓' : '—'}</td>
              <td style={{ display: 'flex', gap: 6 }}>
                <Button size="sm" variant="secondary" onClick={() => toggle(p)}>{p.available ? 'Pausar' : 'Activar'}</Button>
                <Button size="sm" variant="danger" onClick={() => remove(p)}>Borrar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
