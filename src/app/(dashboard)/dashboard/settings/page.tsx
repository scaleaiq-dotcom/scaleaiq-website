"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

type NotifKey = "email" | "push" | "offers" | "newsletter";
type NotifState = Record<NotifKey, boolean>;

const DEFAULT_NOTIFS: NotifState = { email: true, push: false, offers: true, newsletter: false };

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange}
      className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors", checked ? "bg-primary" : "bg-muted-foreground/30")}>
      <span className={cn("size-4 rounded-full bg-white shadow transition-transform", checked ? "translate-x-4" : "translate-x-0.5")} />
    </button>
  );
}

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const [notifs, setNotifs] = React.useState<NotifState>(DEFAULT_NOTIFS);
  const [saving, setSaving] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);

  // Load preferences
  React.useEffect(() => {
    if (!user) return;
    async function load() {
      const { db } = await import("@/lib/firebase/client");
      const { doc, getDoc } = await import("firebase/firestore");
      const snap = await getDoc(doc(db, "users", user!.uid)).catch(() => null);
      if (snap?.exists()) {
        const prefs = snap.data().notifPrefs;
        if (prefs) setNotifs({ ...DEFAULT_NOTIFS, ...prefs });
      }
    }
    load();
  }, [user]);

  async function toggle(k: NotifKey) {
    const next = { ...notifs, [k]: !notifs[k] };
    setNotifs(next);
    if (!user) return;
    setSaving(true);
    const { db } = await import("@/lib/firebase/client");
    const { doc, setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "users", user.uid), { notifPrefs: next }, { merge: true }).catch(() => null);
    setSaving(false);
  }

  async function signOut() {
    const { auth } = await import("@/lib/firebase/client");
    const { signOut: fbSignOut } = await import("firebase/auth");
    await fbSignOut(auth);
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      {/* Notification preferences */}
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold">Notifications</h2>
          {saving && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="space-y-4">
          {[
            { key: "email" as const,      label: "Email Notifications", desc: "Order confirmations, download links" },
            { key: "push" as const,       label: "Push Notifications",  desc: "New products and announcements" },
            { key: "offers" as const,     label: "Offers & Deals",      desc: "Discounts and flash sales" },
            { key: "newsletter" as const, label: "Newsletter",          desc: "Weekly digest of top products" },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Toggle checked={notifs[item.key]} onChange={() => toggle(item.key)} />
            </div>
          ))}
        </div>
      </div>

      {/* Account actions */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 font-heading text-base font-semibold">Account</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Sign Out</p>
              <p className="text-xs text-muted-foreground">Sign out of your account on this device</p>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
          </div>

          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            {!deleteConfirm ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-destructive">Delete Account</p>
                  <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <button onClick={() => setDeleteConfirm(true)}
                  className="rounded-lg border border-destructive px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground">
                  Delete
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-destructive">Are you sure? This cannot be undone.</p>
                <p className="text-xs text-muted-foreground">All your purchases, downloads, and data will be permanently deleted.</p>
                <div className="flex gap-2">
                  <button onClick={() => setDeleteConfirm(false)}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:border-foreground">
                    Cancel
                  </button>
                  <a href="mailto:scaleaiq@gmail.com?subject=Account Deletion Request"
                    className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-white">
                    Email Support to Delete
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
