const { HttpsError } = require("firebase-functions/v2/https");
const { FieldValue } = require("firebase-admin/firestore");
const { db } = require("../lib/admin");

const DAILY_CALL_LIMIT = 30; // generous for real use (a handful of goals/reviews a day), cheap to raise later

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Blocks a uid once it's made DAILY_CALL_LIMIT calls today. Stored under
 * ai_usage/{uid} — this collection has no client-facing Firestore rules,
 * so only this server-side Admin SDK call can read or write it.
 */
async function checkAndIncrementQuota(uid) {
  const ref = db.collection("ai_usage").doc(uid);
  const today = todayStr();
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists ? snap.data() : null;
    if (!data || data.date !== today) {
      tx.set(ref, { date: today, count: 1 });
      return;
    }
    if (data.count >= DAILY_CALL_LIMIT) {
      throw new HttpsError("resource-exhausted", "Daily AI limit reached — try again tomorrow.");
    }
    tx.update(ref, { count: FieldValue.increment(1) });
  });
}

module.exports = { checkAndIncrementQuota, DAILY_CALL_LIMIT, todayStr };
