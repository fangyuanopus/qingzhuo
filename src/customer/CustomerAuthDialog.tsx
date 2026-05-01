import { useState } from 'react';
import { X } from 'lucide-react';
import { ApiError } from '../api/client';
import {
  confirmCustomerPasswordReset,
  loginCustomer,
  registerCustomer,
  requestCustomerPasswordReset,
} from '../api/auth';
import { Button } from '../components/ui/button';
import type { CustomerSession } from '../types/ecommerce';

type CustomerAuthDialogProps = {
  onClose: () => void;
  onAuthenticated: (session: CustomerSession) => void;
};

type Mode = 'login' | 'register' | 'reset';

export function CustomerAuthDialog({ onClose, onAuthenticated }: CustomerAuthDialogProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'reset') {
        if (!resetToken) {
          const result = await requestCustomerPasswordReset({ phone });
          if (result.resetToken) setResetToken(result.resetToken);
          setMessage(result.resetToken ? '已生成本地测试重置码，请确认新密码。' : '如果账号存在，重置短信会发送到该手机号。');
          return;
        }
        await confirmCustomerPasswordReset({ phone, token: resetToken, password });
        setMode('login');
        setPassword('');
        setResetToken('');
        setMessage('密码已重置，请重新登录。');
        return;
      }

      const session =
        mode === 'register'
          ? await registerCustomer({ name, phone, password })
          : await loginCustomer({ phone, password });
      onAuthenticated(session);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '账号操作失败，请检查信息');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1f1a]/55 px-4 py-6 backdrop-blur-sm">
      <form className="relative w-full max-w-md rounded-[28px] border border-white/30 bg-background p-6 shadow-[0_36px_120px_rgba(0,0,0,0.25)]" onSubmit={submit}>
        <button aria-label="关闭账号窗口" className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-foreground/5 text-foreground/60 hover:bg-foreground/10" onClick={onClose} type="button">
          <X className="size-4" />
        </button>

        <p className="font-body text-step--1 font-medium tracking-wider uppercase text-accent">Account</p>
        <h2 className="mt-3 font-display text-step-4 font-normal text-foreground">
          {mode === 'login' ? '用户登录' : mode === 'register' ? '注册清濯账号' : '重置密码'}
        </h2>
        <p className="mt-3 font-body text-step--1 leading-7 text-muted-foreground">
          登录后下单会自动归属到你的账号，可在“我的订单”查看付款、发货和收货地址。
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2 rounded-full bg-foreground/[0.05] p-1">
          {(['login', 'register', 'reset'] as const).map((item) => (
            <button
              className={`rounded-full px-3 py-2 font-body text-step--1 transition ${mode === item ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
              key={item}
              onClick={() => {
                setMode(item);
                setError('');
                setMessage('');
              }}
              type="button"
            >
              {item === 'login' ? '登录' : item === 'register' ? '注册' : '忘记密码'}
            </button>
          ))}
        </div>

        {mode === 'register' && (
          <label className="mt-5 grid gap-2 font-body text-step--1 font-medium text-foreground/70">
            姓名
            <input className="h-12 rounded-xl border border-foreground/10 bg-white/75 px-4 font-body text-step-0 outline-none focus:border-accent dark:bg-white/10" onChange={(event) => setName(event.target.value)} required value={name} />
          </label>
        )}

        <label className="mt-5 grid gap-2 font-body text-step--1 font-medium text-foreground/70">
          手机号
          <input className="h-12 rounded-xl border border-foreground/10 bg-white/75 px-4 font-body text-step-0 outline-none focus:border-accent dark:bg-white/10" onChange={(event) => setPhone(event.target.value)} required value={phone} />
        </label>

        {mode === 'reset' && resetToken && (
          <label className="mt-4 grid gap-2 font-body text-step--1 font-medium text-foreground/70">
            重置码
            <input className="h-12 rounded-xl border border-foreground/10 bg-white/75 px-4 font-body text-step-0 outline-none focus:border-accent dark:bg-white/10" onChange={(event) => setResetToken(event.target.value)} required value={resetToken} />
          </label>
        )}

        {mode !== 'reset' || resetToken ? (
          <label className="mt-4 grid gap-2 font-body text-step--1 font-medium text-foreground/70">
            {mode === 'reset' ? '新密码' : '密码'}
            <input className="h-12 rounded-xl border border-foreground/10 bg-white/75 px-4 font-body text-step-0 outline-none focus:border-accent dark:bg-white/10" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          </label>
        ) : null}

        {message && <p className="mt-4 rounded-xl border border-accent/20 bg-accent/10 px-4 py-3 font-body text-step--1 text-foreground">{message}</p>}
        {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-step--1 text-red-700">{error}</p>}

        <Button className="mt-6 h-12 w-full rounded-full" disabled={submitting} type="submit" variant="hero">
          {submitting ? '处理中...' : mode === 'login' ? '登录账号' : mode === 'register' ? '创建账号' : resetToken ? '确认重置密码' : '获取重置码'}
        </Button>
      </form>
    </div>
  );
}

