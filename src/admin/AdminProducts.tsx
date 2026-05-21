import { useEffect, useState } from 'react';
import { Boxes, Plus, RefreshCw, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  createAdminProduct,
  fetchAdminProducts,
  updateAdminProduct,
  updateAdminSku,
} from './adminApi';
import type { AdminProduct } from './adminTypes';

const money = (cents: number) => `¥${(cents / 100).toFixed(2)}`;

export function AdminProducts({ token }: { token: string }) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [skuName, setSkuName] = useState('');
  const [spec, setSpec] = useState('');
  const [price, setPrice] = useState('39.90');
  const [stock, setStock] = useState('100');

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchAdminProducts(token);
      setProducts(result.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : '商品加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await createAdminProduct(token, {
        name,
        description: null,
        skus: [
          {
            name: skuName,
            spec,
            priceCents: Math.round(Number(price) * 100),
            stock: Number(stock),
            imageUrl: '/assets/qingzhuo/product-front-transparent.png',
          },
        ],
      });
      setName('');
      setSkuName('');
      setSpec('');
      setPrice('39.90');
      setStock('100');
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建商品失败');
    }
  };

  const toggleProduct = async (product: AdminProduct) => {
    await updateAdminProduct(token, product.id, {
      status: product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });
    await loadProducts();
  };

  const updateSkuField = async (
    skuId: string,
    input: { priceCents?: number; stock?: number; status?: 'ACTIVE' | 'INACTIVE' },
  ) => {
    await updateAdminSku(token, skuId, input);
    await loadProducts();
  };

  return (
    <main className="min-h-dvh bg-[#f4f6f1] px-6 py-6 text-foreground">
      <section className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <form className="rounded-2xl border border-foreground/10 bg-white/80 p-5 shadow-sm" onSubmit={submit}>
          <div className="mb-5 flex items-center gap-2">
            <Plus className="size-5 text-accent" />
            <h2 className="font-display text-step-3 font-normal">新增商品</h2>
          </div>
          <div className="grid gap-3">
            <input className="h-11 rounded-xl border border-foreground/10 px-3 font-body outline-none focus:border-accent" onChange={(event) => setName(event.target.value)} placeholder="商品名称" required value={name} />
            <input className="h-11 rounded-xl border border-foreground/10 px-3 font-body outline-none focus:border-accent" onChange={(event) => setSkuName(event.target.value)} placeholder="SKU 名称" required value={skuName} />
            <input className="h-11 rounded-xl border border-foreground/10 px-3 font-body outline-none focus:border-accent" onChange={(event) => setSpec(event.target.value)} placeholder="规格，例如 2kg / 瓶" required value={spec} />
            <input className="h-11 rounded-xl border border-foreground/10 px-3 font-body outline-none focus:border-accent" min="0.01" onChange={(event) => setPrice(event.target.value)} placeholder="价格" required step="0.01" type="number" value={price} />
            <input className="h-11 rounded-xl border border-foreground/10 px-3 font-body outline-none focus:border-accent" min="0" onChange={(event) => setStock(event.target.value)} placeholder="库存" required type="number" value={stock} />
          </div>
          {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 font-body text-step--1 text-red-700">{error}</p>}
          <Button className="mt-5 h-11 rounded-full" type="submit" variant="hero">
            创建商品
          </Button>
        </form>

        <div className="rounded-2xl border border-foreground/10 bg-white/80 p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2">
              <Boxes className="size-5 text-accent" />
              <h2 className="font-display text-step-3 font-normal">商品与库存</h2>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-body text-step--1 text-accent hover:bg-accent/10" onClick={loadProducts} type="button">
              <RefreshCw className="size-4" />
              刷新
            </button>
          </div>

          {loading ? (
            <p className="font-body text-step--1 text-muted-foreground">加载中...</p>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <article className="rounded-xl border border-foreground/8 bg-white p-4" key={product.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-body text-step-0 font-semibold">{product.name}</p>
                      <p className="font-body text-step--2 text-muted-foreground">{product.status}</p>
                    </div>
                    <Button className="h-9 rounded-full px-4 text-step--2" onClick={() => toggleProduct(product)} type="button" variant="heroSecondary">
                      {product.status === 'ACTIVE' ? '下架' : '上架'}
                    </Button>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {product.skus.map((sku) => (
                      <div className="grid gap-3 rounded-xl bg-foreground/[0.04] p-3 md:grid-cols-[1fr_auto_auto_auto] md:items-center" key={sku.id}>
                        <div>
                          <p className="font-body text-step--1 font-medium">{sku.name}</p>
                          <p className="font-body text-step--2 text-muted-foreground">{sku.spec} · {sku.status}</p>
                        </div>
                        <span className="font-body text-step--1">{money(sku.priceCents)}</span>
                        <span className="font-body text-step--1">库存 {sku.stock}</span>
                        <div className="flex flex-wrap gap-2">
                          <Button className="h-9 rounded-full px-3 text-step--2" onClick={() => {
                            const next = window.prompt('输入新价格（元）', (sku.priceCents / 100).toFixed(2));
                            if (next) void updateSkuField(sku.id, { priceCents: Math.round(Number(next) * 100) });
                          }} type="button" variant="heroSecondary">
                            <Save className="mr-1 size-3.5" />
                            改价
                          </Button>
                          <Button className="h-9 rounded-full px-3 text-step--2" onClick={() => {
                            const next = window.prompt('输入新库存', String(sku.stock));
                            if (next) void updateSkuField(sku.id, { stock: Number(next) });
                          }} type="button" variant="heroSecondary">
                            库存
                          </Button>
                          <Button className="h-9 rounded-full px-3 text-step--2" onClick={() => void updateSkuField(sku.id, { status: sku.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })} type="button" variant="heroSecondary">
                            {sku.status === 'ACTIVE' ? '停用' : '启用'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
