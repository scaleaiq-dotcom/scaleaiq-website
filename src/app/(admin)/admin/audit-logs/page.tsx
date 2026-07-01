"use client";

import * as React from "react";
import { Loader2, RefreshCw, ShieldAlert } from "lucide-react";

interface LogEntry {
  id: string; user: string; action: string; target: string;
  createdAt: string; ip?: string;
}

export default function AuditLogsPage() {
  const [logs,    setLogs]    = React.useState<LogEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/audit-logs").catch(() => null);
    if (res?.ok) { const d = await res.json(); setLogs(d.logs ?? []); }
    setLoading(false);
  }

  React.useEffect(() => { load(); }, []);

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Audit Logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track all admin actions for security and compliance.</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-accent disabled:opacity-50 active:scale-95">
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              {["User", "Action", "Target", "Time"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Loading audit logs…
                </div>
              </td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <ShieldAlert className="size-10 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">No audit logs yet</p>
                </div>
              </td></tr>
            ) : logs.map(l => (
              <tr key={l.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 text-xs text-muted-foreground">{l.user}</td>
                <td className="px-4 py-3 font-medium">{l.action}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.target}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{timeAgo(l.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
