import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { OrderDto, OrderStatus } from '../api/types';
import { ordersService } from '../services/ordersService';
import { OrderCard } from '../components/OrderCard';
import { useAuth } from '../auth/AuthContext';

export function OrdersPage({ kitchen = false }: { kitchen?: boolean }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      setOrders(await (kitchen ? ordersService.listKitchen() : ordersService.list()));
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, [kitchen]);

  const advance = async (id: string, next: OrderStatus) => {
    try { await ordersService.advance(id, next); await refresh(); }
    catch (e) { setError((e as Error).message); }
  };
  const cancel = async (id: string) => {
    try { await ordersService.cancel(id); await refresh(); }
    catch (e) { setError((e as Error).message); }
  };

  const canManage = user?.role === 'STAFF' || user?.role === 'ADMIN';

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2>{kitchen ? 'Cocina (pedidos activos)' : 'Pedidos'}</h2>
      {error && <div className="fo-toast fo-toast--err">{error}</div>}
      {loading && <p role="status">Cargando pedidos…</p>}
      {!loading && orders.length === 0 && <p>No hay pedidos.</p>}
      {orders.map(o => (
        <div key={o.id}>
          <OrderCard
            order={o}
            canManage={canManage}
            canCancel={user?.id === o.userId && (o.status === 'PENDING' || o.status === 'CONFIRMED')}
            onAdvance={(next) => advance(o.id, next)}
            onCancel={() => cancel(o.id)}
          />
          <Link to={`/orders/${o.id}`} style={{ fontSize: '0.85rem' }}>Ver detalle</Link>
        </div>
      ))}
    </div>
  );
}
