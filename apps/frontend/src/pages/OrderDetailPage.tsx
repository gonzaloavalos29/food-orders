import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { OrderDto, OrderStatus } from '../api/types';
import { OrderCard } from '../components/OrderCard';
import { useAuth } from '../auth/AuthContext';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!id) return;
    try { const { order } = await api.orders.get(id); setOrder(order); }
    catch (e) { setError((e as Error).message); }
  };
  useEffect(() => { refresh(); }, [id]);

  if (error) return <div style={{ padding: 20 }} className="fo-toast fo-toast--err">{error}</div>;
  if (!order) return <div style={{ padding: 20 }}>Cargando…</div>;

  const canManage = user?.role === 'STAFF' || user?.role === 'ADMIN';
  const canCancel = user?.id === order.userId && (order.status === 'PENDING' || order.status === 'CONFIRMED');

  const advance = async (next: OrderStatus) => {
    try { await api.orders.updateStatus(order.id, next); await refresh(); }
    catch (e) { setError((e as Error).message); }
  };
  const cancel = async () => {
    try { await api.orders.cancel(order.id); await refresh(); }
    catch (e) { setError((e as Error).message); }
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: '0 auto' }}>
      <OrderCard order={order} canManage={canManage} canCancel={canCancel} onAdvance={advance} onCancel={cancel} />
    </div>
  );
}
