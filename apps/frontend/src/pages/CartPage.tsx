import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CartDto } from '../api/types';
import { cartService } from '../services/cartService';
import { ordersService } from '../services/ordersService';
import { CartItemRow } from '../components/CartItemRow';
import { Button } from '../components/Button';
import { Money } from '../components/Money';

export function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => cartService.get().then(setCart).catch(e => setError(e.message));
  useEffect(() => { refresh(); }, []);

  const updateQty = async (productId: string, qty: number) => {
    try {
      setCart(await cartService.changeQuantity(productId, qty));
      setError(null);
    } catch (e) { setError((e as Error).message); }
  };

  const remove = async (productId: string) => {
    try { setCart(await cartService.remove(productId)); }
    catch (e) { setError((e as Error).message); }
  };

  const checkout = async () => {
    try {
      const order = await ordersService.checkout();
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
        {/* v8 ignore next -- items[0] siempre existe: arriba se retorna temprano si el carrito está vacío */}
        <strong>Total: <Money amountInCents={cart.totalInCents} currency={cart.items[0]?.currency ?? 'ARS'} /></strong>
        <Button size="lg" onClick={checkout}>Finalizar pedido</Button>
      </div>
    </div>
  );
}
