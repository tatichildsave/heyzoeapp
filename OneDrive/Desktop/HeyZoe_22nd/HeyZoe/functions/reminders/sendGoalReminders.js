const { onSchedule } = require("firebase-functions/v2/scheduler");
const { FieldValue } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { db } = require("../lib/admin");
const { REMINDER_MIN_GAP_MS, millisSince, localHourInTimezone, isWithinReminderWindow, randomReminderMessage } = require("./schedule-helpers");

/**
 * sendGoalReminders — runs hourly. For every user who has enabled
 * reminders and has a push token, sends at most one notification per
 * REMINDER_MIN_GAP_MS window, and only inside their own local 6am-9pm,
 * and only if they haven't opened the app more recently than that same
 * window. This is intentionally conservative (checks 3 separate
 * conditions) so it can't become the "annoying" case the feature was
 * explicitly asked not to be.
 *
 * Needs the Blaze (pay-as-you-go) plan — scheduled functions run on Cloud
 * Scheduler, which isn't available on the free Spark plan. In practice
 * this runs well within Firebase's free monthly quota for a small user base.
 */
const sendGoalReminders = onSchedule("every 60 minutes", async () => {
  const snap = await db.collection("users").where("remindersEnabled", "==", true).get();
  if (snap.empty) return;

  const messaging = getMessaging();
  let sent = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    if (!data.fcmToken || !data.timezone) continue;

    const hour = localHourInTimezone(data.timezone);
    if (!isWithinReminderWindow(hour)) continue;

    if (millisSince(data.lastOpenedAt) < REMINDER_MIN_GAP_MS) continue; // they've used the app recently
    if (millisSince(data.lastNotifiedAt) < REMINDER_MIN_GAP_MS) continue; // already nudged recently

    try {
      await messaging.send({ token: data.fcmToken, notification: { title: "Hey Zoe", body: randomReminderMessage() } });
      await docSnap.ref.update({ lastNotifiedAt: FieldValue.serverTimestamp() });
      sent += 1;
    } catch (err) {
      // Token is stale/revoked (uninstalled, permissions changed, etc.) — turn
      // reminders off for this user instead of retrying a token that will
      // never succeed again.
      if (err.code === "messaging/registration-token-not-registered") {
        await docSnap.ref.update({ remindersEnabled: false, fcmToken: FieldValue.delete() });
      } else {
        console.error("Failed to send reminder", docSnap.id, err);
      }
    }
  }

  console.log(`sendGoalReminders: sent ${sent} notification(s)`);
});

module.exports = { sendGoalReminders };
