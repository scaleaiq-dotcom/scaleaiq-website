"use client";

import * as React from "react";
import { Plus, Edit2, Trash2, ShieldCheck, X, Check, UserPlus, Users, Search, Loader2 } from "lucide-react";

/* ─── Types ─────────────────────────────────────────────── */
const MODULES = [
  "Dashboard","Products","Categories","Users","Orders",
  "Subscriptions","Coupons","Reviews","Notifications","Workshops",
  "Blog","FAQ","File Manager","Support","Reports",
  "Settings","Roles","Automation","Audit Logs",
];
type Perms = { view: boolean; create: boolean; edit: boolean; delete: boolean };
type User  = { id: string; name: string; email: string; avatar: string };
type Role  = { id: string; name: string; desc: string; color: string; permissions: Record<string, Perms>; memberIds: string[] };

/* ─── Helpers ────────────────────────────────────────────── */
const ALL_ON:   Perms = { view: true,  create: true,  edit: true,  delete: true  };
const VIEW_ONLY:Perms = { view: true,  create: false, edit: false, delete: false };
const OFF:      Perms = { view: false, create: false, edit: false, delete: false };
const COLORS = ["bg-violet-500","bg-blue-500","bg-amber-500","bg-emerald-500","bg-rose-500","bg-cyan-500"];

function buildPerms(preset: "all"|"editor"|"support"): Record<string, Perms> {
  return Object.fromEntries(MODULES.map(m => {
    if (preset === "all")     return [m, ALL_ON];
    if (preset === "editor")  return [m, ["Products","Categories","Blog","FAQ","File Manager"].includes(m) ? ALL_ON : VIEW_ONLY];
    return [m, ["Orders","Support","Users"].includes(m) ? VIEW_ONLY : OFF];
  }));
}

/* ─── Seed data ──────────────────────────────────────────── */
const SEED_ROLES: Role[] = [
  { id: "r1", name: "Super Admin", desc: "Full access to all modules",        color: "bg-violet-500", permissions: buildPerms("all"),    memberIds: [] },
  { id: "r2", name: "Editor",      desc: "Can manage products, blog, FAQ",    color: "bg-blue-500",   permissions: buildPerms("editor"), memberIds: [] },
  { id: "r3", name: "Support",     desc: "View orders and handle tickets",    color: "bg-amber-500",  permissions: buildPerms("support"),memberIds: [] },
];

/* ─── Sub-components ─────────────────────────────────────── */
function PermToggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!on)}
      className={`flex size-6 cursor-pointer items-center justify-center rounded transition-colors
        ${on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"}`}>
      {on && <Check className="size-3" />}
    </button>
  );
}

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${color} text-xs font-bold text-white`}>
      {initials}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function RolesPage() {
  const [roles,        setRoles]        = React.useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = React.useState(true);
  const [users,        setUsers]        = React.useState<User[]>([]);
  const [usersLoading, setUsersLoading] = React.useState(true);
  const [saving,       setSaving]       = React.useState(false);

  async function loadRoles() {
    setRolesLoading(true);
    const res = await fetch("/api/admin/roles").catch(() => null);
    if (res?.ok) {
      const d = await res.json();
      setRoles(d.roles?.map((r: Role & { memberIds?: string[]; members?: string[] }) => ({
        ...r,
        memberIds: r.memberIds ?? r.members ?? [],
        permissions: r.permissions ?? buildPerms("support"),
      })) ?? []);
    }
    setRolesLoading(false);
  }

  React.useEffect(() => {
    loadRoles();
    fetch("/api/admin/users")
      .then(r => r.json())
      .then(d => { if (d.users) setUsers(d.users.map((u: { uid: string; name: string; email: string; avatar: string }) => ({ id: u.uid, name: u.name || u.email, email: u.email, avatar: u.avatar }))); })
      .catch(() => {})
      .finally(() => setUsersLoading(false));
  }, []);
  const [editRole, setEditRole] = React.useState<Role | null>(null);
  const [isNew,    setIsNew]    = React.useState(false);
  const [assignTo, setAssignTo] = React.useState<Role | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [search,   setSearch]   = React.useState("");

  /* helpers */
  function openNew() {
    setIsNew(true);
    setEditRole({ id: crypto.randomUUID(), name: "", desc: "", color: COLORS[0], permissions: buildPerms("support"), memberIds: [] });
  }
  function openEdit(r: Role)   { setIsNew(false); setEditRole(JSON.parse(JSON.stringify(r))); }
  function openAssign(r: Role) { setAssignTo(JSON.parse(JSON.stringify(r))); setSearch(""); }

  async function saveRole() {
    if (!editRole?.name.trim()) return;
    setSaving(true);
    const payload = { name: editRole.name, desc: editRole.desc, color: editRole.color, permissions: editRole.permissions, memberIds: editRole.memberIds };
    if (isNew) {
      await fetch("/api/admin/roles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => null);
    } else {
      await fetch(`/api/admin/roles/${editRole.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => null);
    }
    setEditRole(null);
    await loadRoles();
    setSaving(false);
  }

  async function saveAssign() {
    if (!assignTo) return;
    setSaving(true);
    await fetch(`/api/admin/roles/${assignTo.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberIds: assignTo.memberIds }) }).catch(() => null);
    setAssignTo(null);
    await loadRoles();
    setSaving(false);
  }

  function toggleMember(uid: string) {
    if (!assignTo) return;
    const has = assignTo.memberIds.includes(uid);
    setAssignTo({ ...assignTo, memberIds: has ? assignTo.memberIds.filter(id => id !== uid) : [...assignTo.memberIds, uid] });
  }

  function togglePerm(module: string, key: keyof Perms, val: boolean) {
    if (!editRole) return;
    setEditRole(p => p ? { ...p, permissions: { ...p.permissions, [module]: { ...p.permissions[module], [key]: val } } } : p);
  }

  function toggleAllModule(module: string) {
    if (!editRole) return;
    const p = editRole.permissions[module];
    const allOn = p.view && p.create && p.edit && p.delete;
    setEditRole(prev => prev ? { ...prev, permissions: { ...prev.permissions, [module]: { view: !allOn, create: !allOn, edit: !allOn, delete: !allOn } } } : prev);
  }

  const permCount = (r: Role) => Object.values(r.permissions).reduce((s, p) => s + Object.values(p).filter(Boolean).length, 0);
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Roles & Permissions</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Define what each role can do, then assign users to roles.</p>
        </div>
        <button onClick={openNew}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95">
          <Plus className="size-4" /> Create Role
        </button>
      </div>

      {/* Role cards */}
      {rolesLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" /> Loading roles…
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map(role => {
          const members = users.filter(u => role.memberIds.includes(u.id));
          return (
            <div key={role.id}
              className="rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm">

              {/* Top: icon + name */}
              <div className="flex items-start gap-3">
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${role.color} text-lg font-extrabold text-white shadow-sm`}>
                  {role.name[0] ?? "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-sm font-bold">{role.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{role.desc}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-primary" />
                  {permCount(role)} permissions
                </span>
                <span className="flex items-center gap-1">
                  <Users className="size-3.5" />
                  {members.length} {members.length === 1 ? "member" : "members"}
                </span>
              </div>

              {/* Assigned members avatars */}
              {members.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {members.slice(0, 5).map(u => (
                    <div key={u.id} title={`${u.name} (${u.email})`}
                      className={`flex size-7 cursor-default items-center justify-center rounded-full ${role.color} text-[10px] font-bold text-white ring-2 ring-card`}>
                      {u.avatar}
                    </div>
                  ))}
                  {members.length > 5 && (
                    <span className="text-xs text-muted-foreground">+{members.length - 5} more</span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-3">
                <button onClick={() => openAssign(role)}
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border bg-primary/5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 active:scale-95">
                  <UserPlus className="size-3.5" /> Assign Members
                </button>
                <button onClick={() => openEdit(role)}
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-colors hover:bg-accent active:scale-95">
                  <Edit2 className="size-3.5" /> Edit Permissions
                </button>
                {role.name !== "Super Admin" && (
                  <button onClick={() => setDeleteId(role.id)}
                    className="col-span-2 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-rose-200 py-1.5 text-xs font-medium text-rose-500 transition-colors hover:bg-rose-50 active:scale-95">
                    <Trash2 className="size-3" /> Delete Role
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add tile */}
        <button onClick={openNew}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-95">
          <ShieldCheck className="size-8 opacity-40" />
          <span className="text-sm font-medium">Create Role</span>
        </button>
      </div>

      {/* ── ASSIGN MEMBERS MODAL ─────────────────────────── */}
      {assignTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAssignTo(null)} />
          <div className="relative z-10 flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl border bg-card shadow-2xl">

            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="font-heading text-lg font-bold">Assign Members</h2>
                <p className="text-xs text-muted-foreground">Role: <span className="font-semibold text-foreground">{assignTo.name}</span></p>
              </div>
              <button onClick={() => setAssignTo(null)} className="cursor-pointer rounded-lg p-1.5 hover:bg-accent active:scale-95">
                <X className="size-4" />
              </button>
            </div>

            {/* Search */}
            <div className="border-b px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Search by name or email..." />
              </div>
            </div>

            {/* User list */}
            <div className="flex-1 overflow-y-auto">
              {usersLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                  <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Loading users…
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
                  <Users className="size-8 opacity-30" />
                  {search ? "No users match your search" : "No users have signed up yet"}
                </div>
              ) : filteredUsers.map(user => {
                const assigned = assignTo.memberIds.includes(user.id);
                return (
                  <div key={user.id}
                    onClick={() => toggleMember(user.id)}
                    className={`flex cursor-pointer items-center gap-3 border-b px-5 py-3.5 transition-colors last:border-0
                      ${assigned ? "bg-primary/5" : "hover:bg-accent"}`}>
                    <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${assignTo.color} text-xs font-bold text-white`}>
                      {user.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className={`flex size-5 shrink-0 items-center justify-center rounded border-2 transition-colors
                      ${assigned ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                      {assigned && <Check className="size-3" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 border-t px-6 py-4">
              <button onClick={() => setAssignTo(null)}
                className="flex-1 cursor-pointer rounded-lg border py-2 text-sm font-medium transition-colors hover:bg-accent active:scale-95">
                Cancel
              </button>
              <button onClick={saveAssign} disabled={saving}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 active:scale-95">
                {saving && <Loader2 className="size-3.5 animate-spin" />}
                Save — {assignTo.memberIds.length} {assignTo.memberIds.length === 1 ? "member" : "members"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT PERMISSIONS MODAL ───────────────────────── */}
      {editRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditRole(null)} />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border bg-card shadow-2xl">

            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="font-heading text-lg font-bold">{isNew ? "Create Role" : `Edit Permissions — ${editRole.name}`}</h2>
              <button onClick={() => setEditRole(null)} className="cursor-pointer rounded-lg p-1.5 hover:bg-accent active:scale-95">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Role Name <span className="text-rose-500">*</span></label>
                  <input value={editRole.name} onChange={e => setEditRole(p => p ? { ...p, name: e.target.value } : p)}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g. Content Manager" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Description</label>
                  <input value={editRole.desc} onChange={e => setEditRole(p => p ? { ...p, desc: e.target.value } : p)}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Short description" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Badge Color</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setEditRole(p => p ? { ...p, color: c } : p)}
                      className={`size-7 cursor-pointer rounded-lg ${c} transition-transform hover:scale-110 ${editRole.color === c ? "ring-2 ring-primary ring-offset-2 scale-110" : ""}`} />
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Module Permissions</label>
                <div className="overflow-hidden rounded-xl border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Module</th>
                        {(["view","create","edit","delete"] as (keyof Perms)[]).map(p => (
                          <th key={p} className="px-2 py-2.5 text-center text-xs font-semibold capitalize text-muted-foreground">{p}</th>
                        ))}
                        <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground">All</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {MODULES.map(mod => {
                        const p = editRole.permissions[mod] ?? OFF;
                        const allOn = p.view && p.create && p.edit && p.delete;
                        return (
                          <tr key={mod} className="transition-colors hover:bg-muted/30">
                            <td className="px-4 py-2 text-sm font-medium">{mod}</td>
                            {(["view","create","edit","delete"] as (keyof Perms)[]).map(key => (
                              <td key={key} className="px-2 py-1.5 text-center">
                                <div className="flex justify-center">
                                  <PermToggle on={p[key]} onChange={v => togglePerm(mod, key, v)} />
                                </div>
                              </td>
                            ))}
                            <td className="px-3 py-1.5 text-center">
                              <button type="button" onClick={() => toggleAllModule(mod)}
                                className={`cursor-pointer rounded px-2 py-0.5 text-[10px] font-semibold transition-colors
                                  ${allOn ? "bg-primary/10 text-primary hover:bg-primary/20" : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"}`}>
                                {allOn ? "All on" : "All off"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t px-6 py-4">
              <button onClick={() => setEditRole(null)}
                className="flex-1 cursor-pointer rounded-lg border py-2 text-sm font-medium transition-colors hover:bg-accent active:scale-95">
                Cancel
              </button>
              <button onClick={saveRole} disabled={!editRole.name.trim() || saving}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95">
                {saving && <Loader2 className="size-3.5 animate-spin" />}
                {isNew ? "Create Role" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ───────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border bg-card p-6 shadow-2xl">
            <h2 className="font-heading text-lg font-bold">Delete Role?</h2>
            <p className="mt-2 text-sm text-muted-foreground">All members assigned to this role will lose their permissions. This cannot be undone.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 cursor-pointer rounded-lg border py-2 text-sm font-medium transition-colors hover:bg-accent active:scale-95">Cancel</button>
              <button onClick={async () => { await fetch(`/api/admin/roles/${deleteId}`, { method: "DELETE" }).catch(() => null); setDeleteId(null); await loadRoles(); }}
                className="flex-1 cursor-pointer rounded-lg bg-rose-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600 active:scale-95">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
