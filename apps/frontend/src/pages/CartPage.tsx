import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { CartDto } from '../api/types';
import { CartItemRow } from '../components/CartItemRow';
import { Button } from '../components/Button';
import { Money } from '../components/Money';

export function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => api.cart.get().then(r => setCart(r.cart)).catch(e => setError(e.message));
  useEffect(() => { refresh(); }, []);

  const updateQty = async (productId: string, qty: number) => {
    try {
      const { cart } = qty === 0
        ? await api.cart.remove(productId)
        : await api.cart.update(productId, qty);
      setCart(cart); setError(null);
    } catch (e) { setError((e as Error).message); }
  };

  const remove = async (productId: string) => {
    try { const { cart } = await api.cart.remove(productId); setCart(cart); }
    catch (e) { setError((e as Error).message); }
  };

  const checkout = async () => {
    try {
      const { order } = await api.orders.checkout();
      navigate(`/orders/${order.id}`);
    } catch (e) { setError((e as Error).message); }
  };

  if (!cart) return <div style={{ padding: 20 }}>Cargando…</div>;
  if (cart.items.length === 0) return <div style={{ padding: 20 }}>Tu carrito está vacío.</div>;

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h2>Tu carrito</h2>
      {error && <div className="fo-toast fo-toast--err">{error}</div>}
      {cart.items.map(item => (
        <CartItemRow key={item.productId} item={item} onQuantityChange={updateQty} onRemove={remove} />
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, alignItems: 'center' }}>
        <strong>Total: <Money amountInCents={cart.totalInCents} currency={cart.items[0]?.currency ?? 'ARS'} /></strong>
        <Button size="lg" onClick={checkout}>Finalizar pedido</Button>
      </div>
    </div>
  );
}
