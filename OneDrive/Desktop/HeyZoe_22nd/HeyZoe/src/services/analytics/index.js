import { logEvent, setUserId } from "firebase/analytics";
import { getAnalyticsIfSupported } from "../firebase";

/**
 * Thin wrapper around Firebase Analytics (Google Analytics 4 under the
 * hood) so the rest of the app never has to check "is analytics even
 * available" itself. Every call is fire-and-forget and silently does
 * nothing if:
 *   - no VITE_FIREBASE_MEASUREMENT_ID is set (Analytics isn't enabled
 *     on the Firebase project), or
 *   - the browser doesn't support it (Safari private mode, etc.)
 * so instrumenting a new event is always safe to add without extra guards.
 *
 * View events at: Firebase Console -> Analytics (or the linked GA4
 * property for the full report set, funnels, retention, etc.) — data
 * usually takes a few hours to first appear after events start flowing.
 */
export async function trackEvent(name, params = {}) {
  if (typeof window !== "undefined") {
    // Kept for anything else in the app that wants to listen locally
    // (e.g. a future in-app debug panel) — separate from, and in
    // addition to, the real Analytics event below.
    window.dispatchEvent(new CustomEvent("heyzoe:analytics", { detail: { name, payload: params } }));
  }
  const analytics = await getAnalyticsIfSupported();
  if (!analytics) return;
  try {
    logEvent(analytics, name, params);
  } catch {
    // never let analytics break the app
  }
}

/** GA4's recommended way to track in-app "screens" for a single-page app with no real routes. */
export function trackScreenView(screenName) {
  trackEvent("screen_view", { firebase_screen: screenName, firebase_screen_class: screenName });
}

/** Ties analytics events to the signed-in uid, so per-user behavior is analyzable (still anonymized/pseudonymous — no PII). */
export async function setAnalyticsUser(uid) {
  const analytics = await getAnalyticsIfSupported();
  if (!analytics || !uid) return;
  try {
    setUserId(analytics, uid);
  } catch {
    // never let analytics break the app
  }
}
