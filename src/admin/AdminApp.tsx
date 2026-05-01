import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { AdminLogin } from './AdminLogin';
import { AdminOrders } from './AdminOrders';
import { AdminUsers } from './AdminUsers';
import { AdminAuditLogs } from './AdminAuditLogs';
import { Button } from '../components/ui/button';
import type { AdminUser } from './adminTypes';

const tokenKey = 'qingzhuo-admin-token';
const adminKey = 'qingzhuo-admin-user';

function loadStoredAdmin() {
  const token = sessionStorage.getItem(tokenKey);
  const adminText = sessionStorage.getItem(adminKey);
  if (!token || !adminText) return null;

  try {
    return { token, admin: JSON.parse(adminText) as AdminUser };
  } catch {
    sessionStorage.removeItem(tokenKey);
    sessionStorage.removeItem(adminKey);
    return null;
  }
}

export function AdminApp() {
  const [session, setSession] = useState(loadStoredAdmin);
  const [view, setView] = useState<'orders' | 'users' | 'audit'>('orders');

  const handleLogin = (token: string, admin: AdminUser) => {
    sessionStorage.setItem(tokenKey, token);
    sessionStorage.setItem(adminKey, JSON.stringify(admin));
    setSession({ token, admin });
  };

  const handleLogout = () => {
    sessionStorage.removeItem(tokenKey);
    sessionStorage.removeItem(adminKey);
    setSession(null);
  };

  if (!session) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <main className="min-h-dvh bg-[#f4f6f1] text-foreground">
      <header className="border-b border-foreground/10 bg-white/75 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-body text-step--2 tracking-[0.18em] text-accent">QINGZHUO ADMIN</p>
            <h1 className="font-display text-step-3 font-normal">后台管理</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(['orders', 'users', 'audit'] as const).map((item) => (
              <button
                className={`rounded-full px-4 py-2 font-body text-step--1 transition ${
                  view === item ? 'bg-[#14332d] text-white' : 'bg-foreground/5 text-muted-foreground hover:bg-foreground/10'
                }`}
                key={item}
                onClick={() => setView(item)}
                type="button"
              >
                {item === 'orders' ? '订单处理' : item === 'users' ? '管理员账号' : '操作审计'}
              </button>
            ))}
            <span className="hidden px-2 font-body text-step--1 text-muted-foreground sm:inline">{session.admin.displayName}</span>
            <Button className="rounded-full" onClick={handleLogout} type="button" variant="heroSecondary">
              <LogOut className="mr-2 size-4" />
              退出
            </Button>
          </div>
        </div>
      </header>
      {view === 'orders' && <AdminOrders admin={session.admin} onLogout={handleLogout} token={session.token} />}
      {view === 'users' && <AdminUsers token={session.token} />}
      {view === 'audit' && <AdminAuditLogs token={session.token} />}
    </main>
  );
}
