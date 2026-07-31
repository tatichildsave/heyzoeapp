const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { checkAndIncrementQuota, getPlanForUser, getLimitsForPlan } = require("./quota");

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");

/**
 * askZoe — callable Cloud Function that stands in front of the Anthropic API.
 *
 * The client (src/services/ai/index.js) used to call api.anthropic.com
 * directly from the browser, which can't work without exposing an API key
 * in client code. This function holds the key server-side instead: the
 * client calls askZoe, this function calls Anthropic, and only the result
 * comes back.
 *
 * Every caller must be authenticated (anonymous auth included — see
 * src/hooks/useAuth.js). Usage limits (prompt length, per-user daily/
 * monthly caps, burst-rate spacing, and a project-wide circuit breaker)
 * all come from the single config/ai-usage.config.json — see quota.js —
 * so a leaked function URL can't be used to run up the API bill, and
 * raising or lowering any limit later is a config edit, not a code change.
 *
 * Deploy:
 *   firebase functions:secrets:set ANTHROPIC_API_KEY
 *   firebase deploy --only functions:askZoe
 *
 * Local dev:
 *   firebase emulators:start --only functions
 *   (the client auto-connects to the emulator when running `npm run dev`
 *   with VITE_USE_FIREBASE_EMULATOR=true — see src/services/firebase)
 */
const askZoe = onCall({ secrets: [ANTHROPIC_API_KEY], cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign-in (including guest/anonymous) is required.");
  }

  const { system, user } = request.data || {};

  if (typeof system !== "string" || typeof user !== "string" || !system.trim() || !user.trim()) {
    throw new HttpsError("invalid-argument", "Both 'system' and 'user' must be non-empty strings.");
  }

  const plan = await getPlanForUser(request.auth.uid);
  const limits = getLimitsForPlan(plan);

  if (system.length > limits.maxPromptChars || user.length > limits.maxPromptChars) {
    throw new HttpsError("invalid-argument", "Prompt too long.");
  }

  // Throws (with a specific { reason } detail) if any limit is hit —
  // see quota.js for the four checks this runs.
  await checkAndIncrementQuota(request.auth.uid);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY.value(),
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error("Anthropic API error", response.status, errText);
    throw new HttpsError("internal", "Zoe couldn't reach the AI service right now.");
  }

  const data = await response.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  return { text };
});

module.exports = { askZoe };
