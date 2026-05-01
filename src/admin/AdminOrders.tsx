import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, LogOut, PackageCheck, RefreshCw, Search, Truck } from 'lucide-react';
import { Button } from '../components/ui/button';
import type { OrderStatus } from '../types/ecommerce';
import {
  fetchAdminOrderDetail,
  fetchAdminOrders,
  updateAdminOrderShipping,
  updateAdminOrderStatus,
} from './adminApi';
import type { AdminOrderDetail, AdminOrderSummary, AdminUser } from './adminTypes';

const statusLabels: Record<OrderStatus, string> = {
  PENDING_PAYMENT: '待付款',
  PAID_CONFIRMED: '已确认付款',
  SHIPPING: '发货中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUNDED: '已退款',
};

const statusFilters: Array<OrderStatus | 'ALL'> = [
  'ALL',
  'PENDING_PAYMENT',
  'PAID_CONFIRMED',
  'SHIPPING',
  'COMPLETED',
];

const money = (cents: number) => `¥${(cents / 100).toFixed(2)}`;
const dateText = (value: string) => new Date(value).toLocaleString('zh-CN', { hour12: false });

type AdminOrdersProps = {
  token: string;
  admin: AdminUser;
  onLogout: () => void;
};

export function AdminOrders({ token, admin, onLogout }: AdminOrdersProps) {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shippingCarrier, setShippingCarrier] = useState('顺丰');
  const [trackingNo, setTrackingNo] = useState('');

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedId) ?? null,
    [orders, selectedId],
  );

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchAdminOrders(token, filter);
      setOrders(result.orders);
      if (!selectedId && result.orders[0]) setSelectedId(result.orders[0].id);
      if (selectedId && !result.orders.some((order) => order.id === selectedId)) {
        setSelectedId(result.orders[0]?.id ?? null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '订单加载失败');
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id: string) => {
    setError('');
    try {
      const result = await fetchAdminOrderDetail(token, id);
      setDetail(result.order);
      setShippingCarrier(result.order.shippingCarrier ?? '顺丰');
      setTrackingNo(result.order.trackingNo ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : '订单详情加载失败');
    }
  };

  useEffect(() => {
    void loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    if (selectedId) void loadDetail(selectedId);
    else setDetail(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const refreshCurrent = async () => {
    await loadOrders();
    if (selectedId) await loadDetail(selectedId);
  };

  const setStatus = async (status: OrderStatus, note?: string) => {
    if (!detail) return;
    await updateAdminOrderStatus(token, detail.id, status, note);
    await refreshCurrent();
  };

  const markShipping = async () => {
    if (!detail || !trackingNo.trim()) return;
    await updateAdminOrderShipping(token, detail.id, shippingCarrier, trackingNo.trim());
    await refreshCurrent();
  };

  return (
    <main className="min-h-dvh bg-[#f4f6f1] text-foreground">
      <header className="border-b border-foreground/10 bg-white/75 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="font-body text-step--2 tracking-[0.18em] text-accent">QINGZHUO ADMIN</p>
            <h1 className="font-display text-step-3 font-normal">购买订单</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-body text-step--1 text-muted-foreground sm:inline">{admin.displayName}</span>
            <Button className="rounded-full" onClick={onLogout} type="button" variant="heroSecondary">
              <LogOut className="mr-2 size-4" />
              退出
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 py-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-foreground/10 bg-white/80 p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 font-body text-step--1 text-muted-foreground">
              <Search className="size-4" />
              {loading ? '加载中' : `${orders.length} 条订单`}
            </div>
            <button className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-body text-step--1 text-accent hover:bg-accent/10" onClick={refreshCurrent} type="button">
              <RefreshCw className="size-4" />
              刷新
            </button>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {statusFilters.map((item) => (
              <button
                className={`rounded-full px-3 py-1.5 font-body text-step--2 transition ${
                  filter === item ? 'bg-[#14332d] text-white' : 'bg-foreground/5 text-muted-foreground hover:bg-foreground/10'
                }`}
                key={item}
                onClick={() => setFilter(item)}
                type="button"
              >
                {item === 'ALL' ? '全部' : statusLabels[item]}
              </button>
            ))}
          </div>

          {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 font-body text-step--1 text-red-700">{error}</p>}

          <div className="grid gap-2">
            {orders.map((order) => (
              <button
                className={`rounded-xl border p-4 text-left transition ${
                  selectedId === order.id
                    ? 'border-accent/40 bg-accent/10'
                    : 'border-foreground/8 bg-white hover:border-accent/20'
                }`}
                key={order.id}
                onClick={() => setSelectedId(order.id)}
                type="button"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-body text-step--1 font-semibold text-foreground">{order.orderNo}</span>
                  <span className="rounded-full bg-foreground/5 px-2.5 py-1 font-body text-step--2 text-muted-foreground">
                    {statusLabels[order.status]}
                  </span>
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="font-body text-step-0 font-medium">{order.customerName}</p>
                    <p className="font-body text-step--2 text-muted-foreground">{order.customerPhone}</p>
                  </div>
                  <strong className="font-display text-step-2 font-normal">{money(order.totalAmountCents)}</strong>
                </div>
              </button>
            ))}
            {!loading && orders.length === 0 && (
              <p className="rounded-xl bg-foreground/5 px-4 py-8 text-center font-body text-step--1 text-muted-foreground">
                当前筛选下暂无订单
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-foreground/10 bg-white/80 p-5 shadow-sm">
          {!detail ? (
            <div className="flex min-h-[28rem] items-center justify-center rounded-xl bg-foreground/[0.03] font-body text-muted-foreground">
              选择一条订单查看详情
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-foreground/10 pb-5">
                <div>
                  <p className="font-body text-step--1 text-muted-foreground">{selectedOrder?.orderNo ?? detail.orderNo}</p>
                  <h2 className="mt-1 font-display text-step-4 font-normal">{detail.customer.name}</h2>
                  <p className="mt-2 font-body text-step--1 text-muted-foreground">{detail.customer.phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-step-4 font-normal">{money(detail.totalAmountCents)}</p>
                  <p className="mt-1 font-body text-step--1 text-accent">{statusLabels[detail.status]}</p>
                </div>
              </div>

              <div className="grid gap-5 py-5 md:grid-cols-2">
                <div>
                  <h3 className="font-body text-step--1 font-semibold text-foreground">收货信息</h3>
                  <p className="mt-2 font-body text-step--1 leading-7 text-muted-foreground">{detail.customer.address}</p>
                  {detail.remark && <p className="mt-2 font-body text-step--1 leading-7 text-muted-foreground">备注：{detail.remark}</p>}
                </div>
                <div>
                  <h3 className="font-body text-step--1 font-semibold text-foreground">商品明细</h3>
                  <div className="mt-2 grid gap-2">
                    {detail.items.map((item) => (
                      <div className="flex justify-between gap-3 rounded-xl bg-foreground/[0.04] px-3 py-2 font-body text-step--1" key={item.id}>
                        <span>{item.skuNameSnapshot} x {item.quantity}</span>
                        <span>{money(item.subtotalCents)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 rounded-2xl border border-foreground/8 bg-[#f8faf6] p-4">
                <h3 className="font-body text-step--1 font-semibold text-foreground">订单操作</h3>
                <div className="flex flex-wrap gap-2">
                  {detail.status === 'PENDING_PAYMENT' && (
                    <Button className="rounded-full" onClick={() => setStatus('PAID_CONFIRMED', '管理员已确认扫码收款')} type="button" variant="hero">
                      <CheckCircle2 className="mr-2 size-4" />
                      确认付款
                    </Button>
                  )}
                  {detail.status === 'PENDING_PAYMENT' && (
                    <Button className="rounded-full" onClick={() => setStatus('CANCELLED', '管理员取消订单')} type="button" variant="heroSecondary">
                      取消订单
                    </Button>
                  )}
                  {detail.status === 'PAID_CONFIRMED' && (
                    <div className="flex w-full flex-col gap-3 md:flex-row">
                      <input className="h-11 flex-1 rounded-xl border border-foreground/10 px-3 font-body text-step--1 outline-none focus:border-accent" onChange={(event) => setShippingCarrier(event.target.value)} value={shippingCarrier} />
                      <input className="h-11 flex-1 rounded-xl border border-foreground/10 px-3 font-body text-step--1 outline-none focus:border-accent" onChange={(event) => setTrackingNo(event.target.value)} placeholder="快递单号" value={trackingNo} />
                      <Button className="rounded-full" disabled={!trackingNo.trim()} onClick={markShipping} type="button" variant="hero">
                        <Truck className="mr-2 size-4" />
                        标记发货
                      </Button>
                    </div>
                  )}
                  {detail.status === 'SHIPPING' && (
                    <Button className="rounded-full" onClick={() => setStatus('COMPLETED', '订单完成')} type="button" variant="hero">
                      <PackageCheck className="mr-2 size-4" />
                      标记完成
                    </Button>
                  )}
                  {detail.status === 'PAID_CONFIRMED' && (
                    <Button className="rounded-full" onClick={() => setStatus('REFUNDED', '管理员标记退款')} type="button" variant="heroSecondary">
                      标记退款
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <h3 className="font-body text-step--1 font-semibold text-foreground">状态记录</h3>
                <div className="mt-3 grid gap-2">
                  {detail.statusLogs.map((log) => (
                    <div className="rounded-xl border border-foreground/8 bg-white px-3 py-2 font-body text-step--1" key={log.id}>
                      <div className="flex flex-wrap justify-between gap-2">
                        <span>{log.fromStatus ? `${statusLabels[log.fromStatus]} -> ` : ''}{statusLabels[log.toStatus]}</span>
                        <span className="text-muted-foreground">{dateText(log.createdAt)}</span>
                      </div>
                      {log.note && <p className="mt-1 text-muted-foreground">{log.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
