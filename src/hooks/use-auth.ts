"use client";

import * as React from "react";

interface AuthUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
}

// Cache the promise so parallel hook calls share one request
let sessionPromise: Promise<AuthUser | null> | null = null;

const AUTH_EVENT = "scaleaiq:auth-changed";

/** Call after the session cookie is created/removed so every useAuth() re-checks. */
export function notifyAuthChanged() {
  sessionPromise = null;
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function fetchSession(): Promise<AuthUser | null> {
  if (!sessionPromise) {
    sessionPromise = fetch("/api/auth/session", { credentials: "same-origin" })
      .then(r => r.json())
      .then(d => d.user ?? null)
      .catch(() => null);
    // Clear after 30s so re-login refreshes the cache
    setTimeout(() => { sessionPromise = null; }, 30_000);
  }
  return sessionPromise;
}

export function useAuth(): AuthState {
  const [state, setState] = React.useState<AuthState>({ user: null, loading: true });

  React.useEffect(() => {
    // Kick off session check immediately (fast — no Firebase round-trip)
    fetchSession().then(user => setState({ user, loading: false }));

    // Also listen to Firebase auth for sign-in/sign-out events
    let unsub: (() => void) | undefined;
    async function listenFirebase() {
      const { onAuthStateChanged } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase/client");
      unsub = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
          sessionPromise = null;
          setState({ user: null, loading: false });
          return;
        }
        // After sign-in, re-fetch session to get server-confirmed isAdmin
        sessionPromise = null;
        const user = await fetchSession();
        setState({ user, loading: false });
      });
    }
    listenFirebase();

    // Re-check when sign-in/out completes (cookie created/removed)
    const onAuthEvent = () => fetchSession().then(user => setState({ user, loading: false }));
    window.addEventListener(AUTH_EVENT, onAuthEvent);

    return () => {
      unsub?.();
      window.removeEventListener(AUTH_EVENT, onAuthEvent);
    };
  }, []);

  return state;
}
