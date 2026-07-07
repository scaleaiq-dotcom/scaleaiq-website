"use client";

import * as React from "react";
import { Users, Search, Loader2, RefreshCw, Shield, Gift, Phone, Mail, Bell, Download } from "lucide-react";

interface User {
  uid: string; name: string; email: string; avatar: string;
  createdAt: string | null; lastSignIn: string | null; disabled: boolean;
}

interface Lead {
  id: string;
  type: "signup" | "free_claim" | "notify";
  name: string; email: string; phone: string;
  detail: string; createdAt: string | null;
}

function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "1 day ago" : `${d} days ago`;
}

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",").map(e => e.trim());

const LEAD_BADGE: Record<Lead["type"], { label: string; cls: string; Icon: React.ElementType }> = {
  signup:     { label: "Signup",      cls: "bg-violet-500/10 text-violet-600",   Icon: Gift },
  free_claim: { label: "Free Download", cls: "bg-emerald-500/10 text-emerald-600", Icon: Download },
  notify:     { label: "Notify Me",   cls: "bg-amber-500/10 text-amber-600",     Icon: Bell },
};

/* ── Registered users tab ─────────────────────────────── */
function UsersTab() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [search, setSearch] = React.useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error();
      const d = await res.json();
      setUsers(d.users ?? []);
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{users.length} registered users (Google / email accounts)</p>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="h-9 w-52 rounded-lg border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search users…" />
          </div>
          <button onClick={load} disabled={loading}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-sm transition-colors hover:bg-accent disabled:opacity-50">
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">User</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground sm:table-cell">Email</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground md:table-cell">Joined</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground lg:table-cell">Last Sign In</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-16 text-center">
                <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground/40" />
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Users className="size-12 text-muted-foreground/20" />
                  <p className="font-medium text-muted-foreground">{search ? "No users match" : "No users yet"}</p>
                  <p className="text-sm text-muted-foreground">Users appear here after they sign up.</p>
                </div>
              </td></tr>
            ) : filtered.map(u => {
              const isAdmin = ADMIN_EMAILS.includes(u.email);
              return (
                <tr key={u.uid} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {u.avatar}
                      </div>
                      <span className="text-sm font-medium">{u.name || "—"}</span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">{u.email}</td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">{timeAgo(u.createdAt)}</td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">{timeAgo(u.lastSignIn)}</td>
                  <td className="px-4 py-3">
                    {isAdmin
                      ? <span className="flex items-center gap-1 text-xs font-semibold text-violet-600"><Shield className="size-3" />Admin</span>
                      : <span className="text-xs text-muted-foreground">Customer</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${u.disabled ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600"}`}>
                      {u.disabled ? "Disabled" : "Active"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Leads tab: landing signups + guest downloads + notify-me ── */
function LeadsTab() {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<"all" | Lead["type"]>("all");

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/leads");
      if (!res.ok) throw new Error();
      const d = await res.json();
      setLeads(d.leads ?? []);
    } catch {
      setError("Failed to load leads.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  const filtered = leads.filter(l => {
    const matchType = typeFilter === "all" || l.type === typeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.detail.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const counts = {
    signup: leads.filter(l => l.type === "signup").length,
    free_claim: leads.filter(l => l.type === "free_claim").length,
    notify: leads.filter(l => l.type === "notify").length,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {([["all", `All (${leads.length})`], ["signup", `Signups (${counts.signup})`], ["free_claim", `Downloads (${counts.free_claim})`], ["notify", `Notify Me (${counts.notify})`]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setTypeFilter(k)}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${typeFilter === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="h-9 w-52 rounded-lg border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search leads…" />
          </div>
          <button onClick={load} disabled={loading}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-sm transition-colors hover:bg-accent disabled:opacity-50">
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Type</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground md:table-cell">Details</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">When</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-16 text-center">
                <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground/40" />
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Gift className="size-12 text-muted-foreground/20" />
                  <p className="font-medium text-muted-foreground">{search || typeFilter !== "all" ? "No matching leads" : "No leads yet"}</p>
                  <p className="text-sm text-muted-foreground">Landing signups, guest downloads and notify-me emails appear here.</p>
                </div>
              </td></tr>
            ) : filtered.map(l => {
              const badge = LEAD_BADGE[l.type];
              return (
                <tr key={`${l.type}_${l.id}`} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{l.name || "—"}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      {l.phone && <span className="flex items-center gap-1"><Phone className="size-3" />{l.phone}</span>}
                      {l.email && <span className="flex items-center gap-1"><Mail className="size-3" />{l.email}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badge.cls}`}>
                      <badge.Icon className="size-3" />{badge.label}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">{l.detail}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{timeAgo(l.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Main export with tabs ────────────────────────────── */
export function AdminUsers() {
  const [tab, setTab] = React.useState<"users" | "leads">("users");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-bold">Users &amp; Leads</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Registered accounts, plus every contact captured across the site.</p>
      </div>

      <div className="flex gap-2 border-b pb-1">
        {[
          { key: "users" as const, label: "Registered Users", icon: Users },
          { key: "leads" as const, label: "Leads", icon: Gift },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex cursor-pointer items-center gap-2 rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${tab === key ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "users" ? <UsersTab /> : <LeadsTab />}
    </div>
  );
}
