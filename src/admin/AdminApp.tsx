import { useState } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminOrders } from './AdminOrders';
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

  return <AdminOrders admin={session.admin} onLogout={handleLogout} token={session.token} />;
}
