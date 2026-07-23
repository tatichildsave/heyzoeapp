import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { db, getMessagingIfSupported } from "../firebase";
import { registerServiceWorker } from "../pwa";

/**
 * Goal check-in reminders: a scheduled Cloud Function (see functions/index.js
 * -> sendGoalReminders) checks every user with a saved push token once an
 * hour, and only sends a notification if ALL of these hold:
 *   - it's between 6am-9pm in the user's own timezone
 *   - the app hasn't been opened in the last 6 hours (lastOpenedAt)
 *   - a reminder hasn't already gone out in the last 6 hours (lastNotifiedAt)
 * That "hasn't been opened" check is why we register the timestamp below on
 * every load, not just once.
 */

/** Records that the app was just opened/focused — the "hasn't been opened" half of the reminder logic. */
export async function markAppOpened(uid) {
  if (!uid) return;
  try {
    await setDoc(doc(db, "users", uid), { lastOpenedAt: serverTimestamp() }, { merge: true });
  } catch {
    // best-effort — a missed heartbeat just means a reminder might fire a bit early, not a big deal
  }
}

/**
 * Asks for notification permission and saves the resulting push token +
 * the user's IANA timezone (needed to evaluate the 6am-9pm window
 * server-side) to their profile doc. Reuses the service worker that's
 * already registered on app load (see services/pwa) rather than
 * registering a second one.
 * Returns "granted" | "denied" | "unsupported".
 */
export async function enableGoalReminders(uid) {
  if (!uid) return "unsupported";
  const messaging = await getMessagingIfSupported();
  if (!messaging || !("serviceWorker" in navigator)) return "unsupported";

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission;

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.error("Missing VITE_FIREBASE_VAPID_KEY — generate one in Firebase Console > Project Settings > Cloud Messaging > Web configuration.");
    return "unsupported";
  }

  const registration = await registerServiceWorker();
  if (!registration) return "unsupported";
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  if (!token) return "denied";

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  await setDoc(doc(db, "users", uid), { fcmToken: token, timezone, remindersEnabled: true }, { merge: true });
  return "granted";
}

/** Turns reminders back off — keeps the token around (harmless) but stops the schedule from sending to this user. */
export async function disableGoalReminders(uid) {
  if (!uid) return;
  await setDoc(doc(db, "users", uid), { remindersEnabled: false }, { merge: true });
}
