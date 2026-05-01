import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { fetchMyOrders } from '../api/myOrders';
import type { CustomerOrder, OrderStatus } from '../types/ecommerce';

const statusLabels: Record<OrderStatus, string> = {
  PENDING_PAYMENT: '待付款',
  PAID_CONFIRMED: '已确认付款',
  SHIPPING: '发货中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUNDED: '已退款',
};

const money = (cents: number) => `¥${(cents / 100).toFixed(2)}`;

export function CustomerOrdersDialog({ token, onClose }: { token: string; onClose: () => void }) {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const result = await fetchMyOrders(token);
        if (!cancelled) setOrders(result.orders);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : '订单加载失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1f1a]/55 px-4 py-6 backdrop-blur-sm">
      <section className="relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white/30 bg-background p-6 shadow-[0_36px_120px_rgba(0,0,0,0.25)]">
        <button aria-label="关闭我的订单" className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-foreground/5 text-foreground/60 hover:bg-foreground/10" onClick={onClose} type="button">
          <X className="size-4" />
        </button>
        <p className="font-body text-step--1 font-medium tracking-wider uppercase text-accent">My Orders</p>
        <h2 className="mt-3 font-display text-step-4 font-normal text-foreground">我的订单</h2>

        {loading && <p className="mt-8 font-body text-step--1 text-muted-foreground">订单加载中...</p>}
        {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-step--1 text-red-700">{error}</p>}
        {!loading && orders.length === 0 && (
          <p className="mt-8 rounded-2xl bg-foreground/[0.04] px-5 py-8 text-center font-body text-step--1 text-muted-foreground">
            你还没有订单。
          </p>
        )}

        <div className="mt-6 grid gap-3">
          {orders.map((order) => (
            <article className="rounded-2xl border border-foreground/8 bg-card/60 p-5" key={order.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-body text-step--1 text-muted-foreground">{order.orderNo}</p>
                  <h3 className="mt-1 font-body text-step-1 font-semibold text-foreground">{statusLabels[order.status]}</h3>
                </div>
                <strong className="font-display text-step-3 font-normal text-foreground">{money(order.totalAmountCents)}</strong>
              </div>
              <div className="mt-4 grid gap-2">
                {order.items.map((item) => (
                  <div className="flex justify-between rounded-xl bg-foreground/[0.04] px-3 py-2 font-body text-step--1" key={item.id}>
                    <span>{item.skuNameSnapshot} x {item.quantity}</span>
                    <span>{money(item.subtotalCents)}</span>
                  </div>
                ))}
              </div>
              {order.trackingNo && (
                <p className="mt-4 font-body text-step--1 text-muted-foreground">
                  物流：{order.shippingCarrier} {order.trackingNo}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
