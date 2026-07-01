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

export function useAuth(): AuthState {
  const [state, setState] = React.useState<AuthState>({ user: null, loading: true });

  React.useEffect(() => {
    let unsub: (() => void) | undefined;

    async function init() {
      const { onAuthStateChanged } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase/client");

      unsub = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
          setState({ user: null, loading: false });
          return;
        }
        // Check if admin
        const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",").map(e => e.trim());
        const isAdmin = ADMIN_EMAILS.includes(firebaseUser.email ?? "");
        setState({
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? "",
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            isAdmin,
          },
          loading: false,
        });
      });
    }

    init();
    return () => unsub?.();
  }, []);

  return state;
}
