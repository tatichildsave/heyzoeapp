const { HttpsError } = require("firebase-functions/v2/https");
const { FieldValue } = require("firebase-admin/firestore");
const { db } = require("../lib/admin");
const config = require("../config/ai-usage.config.json");

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function monthStr() {
  return new Date().toISOString().slice(0, 7); // "2026-07"
}

/**
 * Resolves which plan's limits apply to a user. Reads users/{uid}.plan —
 * a field nothing currently sets, since there's no billing yet — and
 * falls back to config.defaultPlan when it's absent. This is the whole
 * point of centralizing limits: turning on Free/Beta/Premium later means
 * writing a "plan" field somewhere (a Stripe webhook, an admin action,
 * whatever), not touching this function at all.
 */
async function getPlanForUser(uid) {
  const snap = await db.collection("users").doc(uid).get();
  const plan = snap.exists ? snap.data().plan : null;
  return config.plans[plan] ? plan : config.defaultPlan;
}

function getLimitsForPlan(plan) {
  return config.plans[plan] || config.plans[config.defaultPlan];
}

/**
 * Four independent checks, in order from broadest to narrowest, all
 * inside one transaction so concurrent requests can't race past each
 * other. Each has its own reason code so the client can show a specific,
 * honest message instead of one generic "something went wrong":
 *
 *   1. global   — project-wide daily ceiling across every user combined
 *   2. rate     — minimum spacing between one user's own calls (burst protection)
 *   3. daily    — this user's per-day cap
 *   4. monthly  — this user's per-month cap (catches "maxes daily limit
 *                 every day for a month" that the daily check alone can't)
 *
 * ai_usage/{uid} and ai_usage_meta/global-{date} both have no client-facing
 * Firestore rules — only this server-side Admin SDK call can read or write
 * either.
 */
async function checkAndIncrementQuota(uid) {
  const plan = await getPlanForUser(uid);
  const limits = getLimitsForPlan(plan);

  const today = todayStr();
  const month = monthStr();
  const userRef = db.collection("ai_usage").doc(uid);
  const globalRef = db.collection("ai_usage_meta").doc(`global-${today}`);

  await db.runTransaction(async (tx) => {
    const [userSnap, globalSnap] = await Promise.all([tx.get(userRef), tx.get(globalRef)]);
    const userData = userSnap.exists ? userSnap.data() : {};
    const globalData = globalSnap.exists ? globalSnap.data() : {};

    const globalCountToday = globalData.date === today ? globalData.count || 0 : 0;
    if (globalCountToday >= config.global.maxCallsPerDayAcrossAllUsers) {
      throw new HttpsError("resource-exhausted", "Zoe is handling a lot of requests right now — please try again shortly.", { reason: "global" });
    }

    if (userData.lastCallAt) {
      const secondsSinceLastCall = (Date.now() - userData.lastCallAt.toDate().getTime()) / 1000;
      if (secondsSinceLastCall < limits.minSecondsBetweenCalls) {
        const wait = Math.ceil(limits.minSecondsBetweenCalls - secondsSinceLastCall);
        throw new HttpsError("resource-exhausted", `Give it ${wait} more second${wait === 1 ? "" : "s"} before asking again.`, { reason: "rate", waitSeconds: wait });
      }
    }

    const dailyCount = userData.date === today ? userData.count || 0 : 0;
    if (dailyCount >= limits.dailyCallLimit) {
      throw new HttpsError("resource-exhausted", `Daily AI limit reached (${limits.dailyCallLimit}) — resets at midnight.`, { reason: "daily", plan, limit: limits.dailyCallLimit });
    }

    const monthlyCount = userData.month === month ? userData.monthlyCount || 0 : 0;
    if (monthlyCount >= limits.monthlyCallLimit) {
      throw new HttpsError("resource-exhausted", `Monthly AI limit reached (${limits.monthlyCallLimit}) — resets next month.`, { reason: "monthly", plan, limit: limits.monthlyCallLimit });
    }

    tx.set(userRef, {
      date: today,
      count: dailyCount + 1,
      month,
      monthlyCount: monthlyCount + 1,
      lastCallAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    tx.set(globalRef, { date: today, count: globalCountToday + 1 }, { merge: true });
  });
}

module.exports = { checkAndIncrementQuota, getPlanForUser, getLimitsForPlan, todayStr, monthStr };
