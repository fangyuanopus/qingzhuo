import { useEffect, useState } from 'react';
import { RefreshCw, ShieldCheck, UserPlus } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  createAdminUser,
  fetchAdminUsers,
  resetAdminUserPassword,
  updateAdminUser,
} from './adminApi';
import type { AdminUser } from './adminTypes';

type AdminUsersProps = {
  token: string;
};

export function AdminUsers({ token }: AdminUsersProps) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'OWNER' | 'STAFF'>('STAFF');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAdmins = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchAdminUsers(token);
      setAdmins(result.admins);
    } catch (err) {
      setError(err instanceof Error ? err.message : '管理员加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await createAdminUser(token, { email, displayName, password, role });
      setEmail('');
      setDisplayName('');
      setPassword('');
      setRole('STAFF');
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建管理员失败');
    }
  };

  const toggleStatus = async (admin: AdminUser) => {
    await updateAdminUser(token, admin.id, {
      status: admin.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED',
    });
    await loadAdmins();
  };

  const resetPassword = async (admin: AdminUser) => {
    const nextPassword = window.prompt(`输入 ${admin.email} 的新密码，至少 8 位`);
    if (!nextPassword) return;
    await resetAdminUserPassword(token, admin.id, nextPassword);
    await loadAdmins();
  };

  return (
    <main className="min-h-dvh bg-[#f4f6f1] px-6 py-6 text-foreground">
      <section className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <form className="rounded-2xl border border-foreground/10 bg-white/80 p-5 shadow-sm" onSubmit={submit}>
          <div className="mb-5 flex items-center gap-2">
            <UserPlus className="size-5 text-accent" />
            <h2 className="font-display text-step-3 font-normal">管理员账号</h2>
          </div>
          <div className="grid gap-3">
            <input className="h-11 rounded-xl border border-foreground/10 px-3 font-body outline-none focus:border-accent" onChange={(event) => setEmail(event.target.value)} placeholder="登录邮箱" required type="email" value={email} />
            <input className="h-11 rounded-xl border border-foreground/10 px-3 font-body outline-none focus:border-accent" onChange={(event) => setDisplayName(event.target.value)} placeholder="显示名称" required value={displayName} />
            <input className="h-11 rounded-xl border border-foreground/10 px-3 font-body outline-none focus:border-accent" minLength={8} onChange={(event) => setPassword(event.target.value)} placeholder="初始密码" required type="password" value={password} />
            <select className="h-11 rounded-xl border border-foreground/10 px-3 font-body outline-none focus:border-accent" onChange={(event) => setRole(event.target.value as 'OWNER' | 'STAFF')} value={role}>
              <option value="STAFF">订单运营</option>
              <option value="OWNER">超级管理员</option>
            </select>
          </div>
          {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 font-body text-step--1 text-red-700">{error}</p>}
          <Button className="mt-5 h-11 rounded-full" type="submit" variant="hero">
            创建管理员
          </Button>
        </form>

        <div className="rounded-2xl border border-foreground/10 bg-white/80 p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2">
              <ShieldCheck className="size-5 text-accent" />
              <h2 className="font-display text-step-3 font-normal">账号列表</h2>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-body text-step--1 text-accent hover:bg-accent/10" onClick={loadAdmins} type="button">
              <RefreshCw className="size-4" />
              刷新
            </button>
          </div>
          {loading ? (
            <p className="font-body text-step--1 text-muted-foreground">加载中...</p>
          ) : (
            <div className="grid gap-3">
              {admins.map((admin) => (
                <article className="rounded-xl border border-foreground/8 bg-white p-4" key={admin.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-body text-step-0 font-semibold">{admin.displayName}</p>
                      <p className="font-body text-step--2 text-muted-foreground">{admin.email}</p>
                    </div>
                    <span className="rounded-full bg-foreground/5 px-3 py-1 font-body text-step--2 text-muted-foreground">
                      {admin.role} · {admin.status}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button className="h-9 rounded-full px-4 text-step--2" onClick={() => toggleStatus(admin)} type="button" variant="heroSecondary">
                      {admin.status === 'DISABLED' ? '启用' : '禁用'}
                    </Button>
                    <Button className="h-9 rounded-full px-4 text-step--2" onClick={() => resetPassword(admin)} type="button" variant="heroSecondary">
                      重置密码
                    </Button>
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

