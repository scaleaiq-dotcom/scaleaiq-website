"use client";

import * as React from "react";
import { User, Camera, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [profileLoaded, setProfileLoaded] = React.useState(false);

  // Load existing profile
  React.useEffect(() => {
    if (!user) return;
    async function loadProfile() {
      const { db } = await import("@/lib/firebase/client");
      const { doc, getDoc } = await import("firebase/firestore");
      const snap = await getDoc(doc(db, "users", user!.uid)).catch(() => null);
      if (snap?.exists()) {
        const data = snap.data();
        setName(data.name ?? user!.displayName ?? "");
        setPhone(data.phone ?? "");
      } else {
        setName(user!.displayName ?? "");
      }
      setProfileLoaded(true);
    }
    loadProfile();
  }, [user]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { db } = await import("@/lib/firebase/client");
      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
      await setDoc(doc(db, "users", user.uid), {
        name,
        phone,
        email: user.email,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Also update Firebase Auth display name
      const { auth } = await import("@/lib/firebase/client");
      const { updateProfile } = await import("firebase/auth");
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !profileLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="size-20 rounded-full object-cover" />
          ) : (
            <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400">
              <User className="size-8 text-white" />
            </div>
          )}
          <button className="absolute -bottom-1 -right-1 rounded-full border-2 border-card bg-primary p-1 text-primary-foreground">
            <Camera className="size-3" />
          </button>
        </div>
        <div>
          <p className="font-semibold">{name || "Profile Photo"}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <button className="mt-1 text-xs font-medium text-primary hover:underline">Upload photo</button>
        </div>
      </div>

      <form onSubmit={saveProfile} className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-heading text-base font-semibold">Personal Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Full Name</label>
            <Input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Phone Number</label>
            <Input placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email</label>
          <Input type="email" disabled value={user?.email ?? ""} className="opacity-60" />
          <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed here</p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 size-4 animate-spin" /> Saving…</> : "Save Changes"}
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-emerald-600">
              <CheckCircle2 className="size-4" /> Saved!
            </span>
          )}
        </div>
      </form>

      <PasswordSection />
    </div>
  );
}

function PasswordSection() {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) { setMsg({ type: "err", text: "Passwords don't match" }); return; }
    if (next.length < 8) { setMsg({ type: "err", text: "Password must be at least 8 characters" }); return; }
    setSaving(true); setMsg(null);
    try {
      const { auth } = await import("@/lib/firebase/client");
      const { EmailAuthProvider, reauthenticateWithCredential, updatePassword: fbUpdatePassword } = await import("firebase/auth");
      const firebaseUser = auth.currentUser;
      if (!firebaseUser?.email) throw new Error("Not logged in");
      const cred = EmailAuthProvider.credential(firebaseUser.email, current);
      await reauthenticateWithCredential(firebaseUser, cred);
      await fbUpdatePassword(firebaseUser, next);
      setMsg({ type: "ok", text: "Password updated!" });
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed";
      setMsg({ type: "err", text: message.includes("wrong-password") ? "Current password is incorrect" : message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={updatePassword} className="rounded-xl border bg-card p-6 space-y-4">
      <h2 className="font-heading text-base font-semibold">Change Password</h2>
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Current Password</label>
          <Input type="password" placeholder="••••••••" value={current} onChange={e => setCurrent(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">New Password</label>
          <Input type="password" placeholder="Min 8 characters" value={next} onChange={e => setNext(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Confirm Password</label>
          <Input type="password" placeholder="Repeat new password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" variant="outline" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 size-4 animate-spin" /> Updating…</> : "Update Password"}
          </Button>
          {msg && (
            <span className={`text-sm ${msg.type === "ok" ? "text-emerald-600" : "text-rose-500"}`}>
              {msg.text}
            </span>
          )}
        </div>
      </div>
    </form>
  );
}
