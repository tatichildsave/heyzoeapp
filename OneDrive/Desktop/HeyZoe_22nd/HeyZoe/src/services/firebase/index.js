import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getMessaging, isSupported as isMessagingSupported } from "firebase/messaging";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
  // Optional — only needed for Analytics (see services/analytics). Everything
  // else in the app works fine without it.
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
};

const PLACEHOLDER_TOKENS = ["YOUR_API_KEY", "YOUR_AUTH_DOMAIN", "YOUR_PROJECT_ID", "YOUR_STORAGE_BUCKET", "YOUR_MESSAGING_SENDER_ID", "YOUR_APP_ID"];

export const isFirebaseConfigured = !Object.values(firebaseConfig).some((value) => PLACEHOLDER_TOKENS.includes(value));

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export { firebaseConfig };

// Push notifications (Cloud Messaging) aren't supported everywhere (e.g.
// Safari < 16, or non-secure contexts) — resolve lazily and let callers
// check for `null` rather than crashing at import time.
let messagingInstance = null;
export async function getMessagingIfSupported() {
  if (!isFirebaseConfigured) return null;
  if (messagingInstance) return messagingInstance;
  try {
    if (!(await isMessagingSupported())) return null;
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch {
    return null;
  }
}

// Point at the local Functions emulator during development so you don't need
// a deployed function (or a real API key on your machine) just to iterate.
// Enable with VITE_USE_FIREBASE_EMULATOR=true in your .env.
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true") {
  connectFunctionsEmulator(functions, "localhost", 5001);
}

// Analytics needs its own measurementId (separate from the rest of the
// Firebase config) and doesn't work everywhere (Safari private browsing,
// non-browser environments, ad blockers) — resolve lazily and silently
// no-op rather than crash when it's unavailable.
let analyticsInstance = null;
export async function getAnalyticsIfSupported() {
  if (!isFirebaseConfigured || !firebaseConfig.measurementId) return null;
  if (analyticsInstance) return analyticsInstance;
  try {
    if (!(await isAnalyticsSupported())) return null;
    analyticsInstance = getAnalytics(app);
    return analyticsInstance;
  } catch {
    return null;
  }
}
