import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "";
  privateKey = privateKey.replace(/^["']/, "").replace(/["'],?\s*$/, "");
  privateKey = privateKey.replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export const adminApp = getAdminApp();
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);

// Lazy-load auth to avoid pulling jwks-rsa (ESM/CJS conflict with jose v6)
// at module load time. Only loaded when a request actually needs auth.
export async function getAdminAuth() {
  const { getAuth } = await import("firebase-admin/auth");
  return getAuth(adminApp);
}
