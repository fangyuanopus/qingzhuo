import { useEffect, useState } from 'react';
import { Plus, QrCode, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  createAdminPaymentMethod,
  fetchAdminPaymentMethods,
  updateAdminPaymentMethod,
} from './adminApi';
import type { AdminPaymentMethod } from './adminTypes';

export function AdminPaymentMethods({ token }: { token: string }) {
  const [methods, setMethods] = useState<AdminPaymentMethod[]>([]);
  const [type, setType] = useState<'WECHAT' | 'ALIPAY'>('WECHAT');
  const [name, setName] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('/assets/qingzhuo/logo-transparent.png');
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadMethods = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchAdminPaymentMethods(token);
      setMethods(result.paymentMethods);
    } catch (err) {
      setError(err instanceof Error ? err.message : '收款方式加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await createAdminPaymentMethod(token, { type, name, qrCodeUrl, instructions, enabled: true });
      setName('');
      setQrCodeUrl('/assets/qingzhuo/logo-transparent.png');
      setInstructions('');
      await loadMethods();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建收款方式失败');
    }
  };

  const toggle = async (method: AdminPaymentMethod) => {
    await updateAdminPaymentMethod(token, method.id, { enabled: !method.enabled });
    await loadMethods();
  };

  const rename = async (method: AdminPaymentMethod) => {
    const next = window.prompt('输入新的显示名称', method.name);
    if (!next) return;
    await updateAdminPaymentMethod(token, method.id, { name: next });
    await loadMethods();
  };

  return (
    <main className="min-h-dvh bg-[#f4f6f1] px-6 py-6 text-foreground">
      <section className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <form className="rounded-2xl border border-foreground/10 bg-white/80 p-5 shadow-sm" onSubmit={submit}>
          <div className="mb-5 flex items-center gap-2">
            <Plus className="size-5 text-accent" />
            <h2 className="font-display text-step-3 font-normal">新增收款码</h2>
          </div>
          <div className="grid gap-3">
            <select className="h-11 rounded-xl border border-foreground/10 px-3 font-body outline-none focus:border-accent" onChange={(event) => setType(event.target.value as 'WECHAT' | 'ALIPAY')} value={type}>
              <option value="WECHAT">微信</option>
              <option value="ALIPAY">支付宝</option>
            </select>
            <input className="h-11 rounded-xl border border-foreground/10 px-3 font-body outline-none focus:border-accent" onChange={(event) => setName(event.target.value)} placeholder="显示名称" required value={name} />
            <input className="h-11 rounded-xl border border-foreground/10 px-3 font-body outline-none focus:border-accent" onChange={(event) => setQrCodeUrl(event.target.value)} placeholder="二维码图片路径" required value={qrCodeUrl} />
            <textarea className="min-h-28 rounded-xl border border-foreground/10 px-3 py-3 font-body outline-none focus:border-accent" onChange={(event) => setInstructions(event.target.value)} placeholder="付款说明" required value={instructions} />
          </div>
          {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 font-body text-step--1 text-red-700">{error}</p>}
          <Button className="mt-5 h-11 rounded-full" type="submit" variant="hero">
            创建收款方式
          </Button>
        </form>

        <div className="rounded-2xl border border-foreground/10 bg-white/80 p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2">
              <QrCode className="size-5 text-accent" />
              <h2 className="font-display text-step-3 font-normal">收款方式</h2>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-body text-step--1 text-accent hover:bg-accent/10" onClick={loadMethods} type="button">
              <RefreshCw className="size-4" />
              刷新
            </button>
          </div>

          {loading ? (
            <p className="font-body text-step--1 text-muted-foreground">加载中...</p>
          ) : (
            <div className="grid gap-3">
              {methods.map((method) => (
                <article className="rounded-xl border border-foreground/8 bg-white p-4" key={method.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-body text-step-0 font-semibold">{method.name}</p>
                      <p className="font-body text-step--2 text-muted-foreground">{method.type} · {method.enabled ? '启用' : '停用'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button className="h-9 rounded-full px-4 text-step--2" onClick={() => rename(method)} type="button" variant="heroSecondary">
                        改名
                      </Button>
                      <Button className="h-9 rounded-full px-4 text-step--2" onClick={() => toggle(method)} type="button" variant="heroSecondary">
                        {method.enabled ? '停用' : '启用'}
                      </Button>
                    </div>
                  </div>
                  <p className="mt-3 break-all font-body text-step--2 text-muted-foreground">{method.qrCodeUrl}</p>
                  <p className="mt-2 font-body text-step--1 leading-7 text-muted-foreground">{method.instructions}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
