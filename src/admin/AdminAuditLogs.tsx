import { useEffect, useState } from 'react';
import { RefreshCw, ScrollText } from 'lucide-react';
import { fetchAuditLogs } from './adminApi';
import type { AuditLog } from './adminTypes';

const dateText = (value: string) => new Date(value).toLocaleString('zh-CN', { hour12: false });

export function AdminAuditLogs({ token }: { token: string }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchAuditLogs(token);
      setLogs(result.logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : '审计日志加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-dvh bg-[#f4f6f1] px-6 py-6 text-foreground">
      <section className="mx-auto max-w-7xl rounded-2xl border border-foreground/10 bg-white/80 p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2">
            <ScrollText className="size-5 text-accent" />
            <h2 className="font-display text-step-3 font-normal">操作审计</h2>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-body text-step--1 text-accent hover:bg-accent/10" onClick={loadLogs} type="button">
            <RefreshCw className="size-4" />
            刷新
          </button>
        </div>
        {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 font-body text-step--1 text-red-700">{error}</p>}
        {loading ? (
          <p className="font-body text-step--1 text-muted-foreground">加载中...</p>
        ) : (
          <div className="grid gap-3">
            {logs.map((log) => (
              <article className="rounded-xl border border-foreground/8 bg-white p-4" key={log.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-body text-step-0 font-semibold">{log.action}</p>
                    <p className="font-body text-step--2 text-muted-foreground">
                      {log.targetType}{log.targetId ? ` · ${log.targetId}` : ''}
                    </p>
                  </div>
                  <span className="font-body text-step--2 text-muted-foreground">{dateText(log.createdAt)}</span>
                </div>
                <p className="mt-2 font-body text-step--2 text-muted-foreground">
                  操作人：{log.actorAdmin ? `${log.actorAdmin.displayName} (${log.actorAdmin.email})` : '系统'}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

