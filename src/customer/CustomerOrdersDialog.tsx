import { useEffect, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { createCustomerAddress, deleteCustomerAddress, fetchCustomerAddresses } from '../api/customerAddresses';
import { fetchMyOrders } from '../api/myOrders';
import type { CustomerAddress, CustomerOrder, OrderStatus } from '../types/ecommerce';

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
  const [tab, setTab] = useState<'orders' | 'addresses'>('orders');
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [receiverName, setReceiverName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [orderResult, addressResult] = await Promise.all([
        fetchMyOrders(token),
        fetchCustomerAddresses(token),
      ]);
      setOrders(orderResult.orders);
      setAddresses(addressResult.addresses);
    } catch (err) {
      setError(err instanceof Error ? err.message : '账号信息加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const submitAddress = async (event: React.FormEvent) => {
    event.preventDefault();
    await createCustomerAddress(token, {
      receiverName,
      phone,
      address,
      isDefault: addresses.length === 0,
    });
    setReceiverName('');
    setPhone('');
    setAddress('');
    await load();
  };

  const removeAddress = async (id: string) => {
    await deleteCustomerAddress(token, id);
    await load();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1f1a]/55 px-4 py-6 backdrop-blur-sm">
      <section className="relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white/30 bg-background p-6 shadow-[0_36px_120px_rgba(0,0,0,0.25)]">
        <button aria-label="关闭账号中心" className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-foreground/5 text-foreground/60 hover:bg-foreground/10" onClick={onClose} type="button">
          <X className="size-4" />
        </button>
        <p className="font-body text-step--1 font-medium tracking-wider uppercase text-accent">Account Center</p>
        <h2 className="mt-3 font-display text-step-4 font-normal text-foreground">我的账号</h2>

        <div className="mt-6 inline-flex rounded-full bg-foreground/[0.05] p-1">
          {(['orders', 'addresses'] as const).map((item) => (
            <button
              className={`rounded-full px-4 py-2 font-body text-step--1 transition ${tab === item ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
              key={item}
              onClick={() => setTab(item)}
              type="button"
            >
              {item === 'orders' ? '我的订单' : '收货地址'}
            </button>
          ))}
        </div>

        {loading && <p className="mt-8 font-body text-step--1 text-muted-foreground">加载中...</p>}
        {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-step--1 text-red-700">{error}</p>}

        {!loading && tab === 'orders' && (
          <div className="mt-6 grid gap-3">
            {orders.length === 0 && (
              <p className="rounded-2xl bg-foreground/[0.04] px-5 py-8 text-center font-body text-step--1 text-muted-foreground">
                你还没有订单。
              </p>
            )}
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
        )}

        {!loading && tab === 'addresses' && (
          <div className="mt-6 grid gap-4">
            <form className="grid gap-3 rounded-2xl border border-foreground/8 bg-card/60 p-5" onSubmit={submitAddress}>
              <div className="grid gap-3 md:grid-cols-2">
                <input className="h-11 rounded-xl border border-foreground/10 px-3 font-body outline-none focus:border-accent" onChange={(event) => setReceiverName(event.target.value)} placeholder="收货人" required value={receiverName} />
                <input className="h-11 rounded-xl border border-foreground/10 px-3 font-body outline-none focus:border-accent" onChange={(event) => setPhone(event.target.value)} placeholder="手机号" required value={phone} />
              </div>
              <input className="h-11 rounded-xl border border-foreground/10 px-3 font-body outline-none focus:border-accent" onChange={(event) => setAddress(event.target.value)} placeholder="详细地址" required value={address} />
              <button className="h-11 rounded-full bg-[#14332d] px-5 font-body text-step--1 text-white" type="submit">
                保存地址
              </button>
            </form>
            {addresses.map((item) => (
              <article className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-foreground/8 bg-card/60 p-5" key={item.id}>
                <div>
                  <p className="font-body text-step-0 font-semibold">{item.receiverName} · {item.phone}</p>
                  <p className="mt-2 font-body text-step--1 text-muted-foreground">{item.address}</p>
                </div>
                <button className="inline-flex size-9 items-center justify-center rounded-full bg-foreground/5 text-foreground/50 hover:bg-red-50 hover:text-red-700" onClick={() => removeAddress(item.id)} type="button">
                  <Trash2 className="size-4" />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

