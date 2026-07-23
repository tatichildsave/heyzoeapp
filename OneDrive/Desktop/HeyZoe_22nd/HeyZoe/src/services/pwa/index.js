import { firebaseConfig } from "../firebase";
import { trackEvent } from "../analytics";

/**
 * The same service worker file does double duty (see
 * public/firebase-messaging-sw.js): basic offline caching for
 * installability, and — once Firebase config is present in its own
 * registration URL — push messaging too. Passing config unconditionally
 * here means both are ready from the very first load; enabling push
 * notifications later (services/push) just reuses this registration
 * instead of registering a second time. None of these config values are
 * secret, so putting them in a URL is fine.
 */
function swUrlWithConfig() {
  const params = new URLSearchParams({
    apiKey: firebaseConfig.apiKey || "",
    authDomain: firebaseConfig.authDomain || "",
    projectId: firebaseConfig.projectId || "",
    storageBucket: firebaseConfig.storageBucket || "",
    messagingSenderId: firebaseConfig.messagingSenderId || "",
    appId: firebaseConfig.appId || "",
  });
  return `/firebase-messaging-sw.js?${params.toString()}`;
}

let registrationPromise = null;

/** Registers the service worker once per page load; safe to call from multiple places. */
export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return Promise.resolve(null);
  if (!registrationPromise) {
    registrationPromise = navigator.serviceWorker.register(swUrlWithConfig()).catch((err) => {
      console.error("Service worker registration failed", err);
      return null;
    });
  }
  return registrationPromise;
}

// Chrome/Edge/Android fire this instead of showing their own install UI,
// so we can offer a proper in-app "Install" button. Safari/iOS never
// fire it — there's no way around that, only a manual "Add to Home
// Screen" via the share sheet, which is why usePwaInstall (the hook that
// reads this) also detects iOS separately and shows instructions instead.
let deferredInstallPrompt = null;
const listeners = new Set();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    listeners.forEach((cb) => cb(true));
  });
  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    trackEvent("pwa_installed");
    listeners.forEach((cb) => cb(false));
  });
}

export function onInstallAvailabilityChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function hasDeferredInstallPrompt() {
  return !!deferredInstallPrompt;
}

/** Shows the native install prompt. Resolves "accepted" | "dismissed" | "unavailable". */
export async function promptInstall() {
  if (!deferredInstallPrompt) return "unavailable";
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  return outcome; // "accepted" | "dismissed"
}

export function isRunningStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

export function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}
