import { useState } from 'react';
import { Lock, LogIn } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ApiError } from '../api/client';
import { loginAdmin } from './adminApi';
import type { AdminUser } from './adminTypes';

type AdminLoginProps = {
  onLogin: (token: string, admin: AdminUser) => void;
};

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('admin@qingzhuo.local');
  const [password, setPassword] = useState('change-this-password');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const result = await loginAdmin(email, password);
      onLogin(result.token, result.admin);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '登录失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-dvh bg-[linear-gradient(135deg,hsl(155_18%_96%),hsl(42_28%_94%))] px-6 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-5xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[28px] border border-foreground/10 bg-white/65 shadow-[0_32px_90px_rgba(24,48,40,0.12)] backdrop-blur-xl md:grid-cols-[1fr_0.9fr]">
          <div className="flex min-h-[30rem] flex-col justify-between bg-[#14332d] p-8 text-white md:p-10">
            <div>
              <p className="font-body text-step--1 tracking-[0.2em] text-white/55">QINGZHUO ADMIN</p>
              <h1 className="mt-5 font-display text-step-5 font-normal leading-tight">订单核款与发货工作台</h1>
            </div>
            <div className="grid gap-3 font-body text-step--1 text-white/70">
              <span>扫码付款订单集中查看</span>
              <span>人工确认付款与发货状态</span>
              <span>保留完整订单状态记录</span>
            </div>
          </div>

          <form className="flex flex-col justify-center p-8 md:p-10" onSubmit={submit}>
            <div className="mb-8 inline-flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Lock className="size-5" />
            </div>
            <h2 className="font-display text-step-4 font-normal">管理员登录</h2>
            <p className="mt-3 font-body text-step--1 leading-7 text-muted-foreground">
              使用初始化管理员账号进入订单后台。
            </p>

            <label className="mt-8 grid gap-2 font-body text-step--1 font-medium text-foreground/70">
              邮箱
              <input
                className="h-12 rounded-xl border border-foreground/10 bg-white px-4 font-body text-step-0 outline-none transition focus:border-accent"
                onChange={(event) => setEmail(event.target.value)}
                value={email}
              />
            </label>

            <label className="mt-4 grid gap-2 font-body text-step--1 font-medium text-foreground/70">
              密码
              <input
                className="h-12 rounded-xl border border-foreground/10 bg-white px-4 font-body text-step-0 outline-none transition focus:border-accent"
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                value={password}
              />
            </label>

            {error && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-step--1 text-red-700">
                {error}
              </p>
            )}

            <Button className="mt-7 h-12 rounded-full" disabled={submitting} type="submit" variant="hero">
              <LogIn className="mr-2 size-4" />
              {submitting ? '登录中...' : '进入后台'}
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
