import config from "../../config/ai-usage.config.json";

/**
 * Mirrors functions/ai/quota.js's getLimitsForPlan — same fallback
 * behavior, same shared JSON file as the actual server-side enforcement.
 * This function is duplicated (Node's CommonJS Cloud Functions and
 * Vite's ESM client can't share one executable module without extra
 * build tooling disproportionate to a one-line lookup) but the NUMBERS
 * themselves are not: both read config/ai-usage.config.json directly, so
 * changing a limit only ever means editing that one file.
 *
 * Never use this to gate anything client-side — the server is the only
 * real enforcement point. This exists purely so user-facing copy (e.g.
 * "up to 30 requests a day") can't drift out of sync with the real limit.
 */
export function getLimitsForPlan(plan) {
  return config.plans[plan] || config.plans[config.defaultPlan];
}

export const DEFAULT_PLAN = config.defaultPlan;
