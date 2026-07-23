const REMINDER_WINDOW_START_HOUR = 6; // 6am
const REMINDER_WINDOW_END_HOUR = 21; // 9pm
const REMINDER_MIN_GAP_MS = 6 * 60 * 60 * 1000; // 6 hours
const REMINDER_MESSAGES = [
  "Your goals are still waiting — got a minute to check in?",
  "A small step today keeps the streak alive.",
  "Zoe here — how's progress looking today?",
  "One quick check-in keeps momentum going.",
];

function millisSince(timestamp) {
  if (!timestamp) return Infinity; // never happened = "long enough ago"
  return Date.now() - timestamp.toDate().getTime();
}

function localHourInTimezone(timezone) {
  try {
    const hourStr = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hour12: false }).format(new Date());
    return parseInt(hourStr, 10) % 24;
  } catch {
    return null; // unknown/invalid timezone — skip this user rather than guess
  }
}

function isWithinReminderWindow(hour) {
  return hour !== null && hour >= REMINDER_WINDOW_START_HOUR && hour < REMINDER_WINDOW_END_HOUR;
}

function randomReminderMessage() {
  return REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];
}

module.exports = {
  REMINDER_WINDOW_START_HOUR,
  REMINDER_WINDOW_END_HOUR,
  REMINDER_MIN_GAP_MS,
  millisSince,
  localHourInTimezone,
  isWithinReminderWindow,
  randomReminderMessage,
};
