const DAY_MS = 86400000;
const WEEK_MS = 7 * DAY_MS;

/**
 * weekDue is a relative number ("week 12") set when the goal is drafted —
 * on its own it can't tell you whether that week has actually arrived.
 * Anchoring it to the goal's createdAt turns it into a real calendar date.
 */
export function milestoneDueDate(goal, milestone) {
  if (!goal.createdAt) return null;
  const start = new Date(goal.createdAt);
  return new Date(start.getTime() + (milestone.weekDue - 1) * WEEK_MS);
}

/** "done" | "overdue" | "due-this-week" | "upcoming" */
export function milestoneStatus(goal, milestone) {
  if (milestone.done) return "done";
  const due = milestoneDueDate(goal, milestone);
  if (!due) return "upcoming"; // no start date on record — can't say anything more specific
  const daysUntilDue = Math.floor((due.getTime() - Date.now()) / DAY_MS);
  if (daysUntilDue < 0) return "overdue";
  if (daysUntilDue <= 6) return "due-this-week";
  return "upcoming";
}

/**
 * The single milestone (across every goal) worth prompting about right
 * now: the oldest overdue one if any exist, otherwise the soonest one
 * due this week, otherwise just the next upcoming one. This is what
 * makes Home's "Today" card point at a specific, time-relevant task
 * instead of just whichever incomplete milestone happens to be first in
 * the array.
 */
export function findMostUrgentMilestone(goals) {
  const all = goals.flatMap((g) =>
    (g.milestones || [])
      .filter((m) => !m.done)
      .map((m) => ({ ...m, goalId: g.id, goalTitle: g.title, categoryId: g.categoryId, status: milestoneStatus(g, m), dueDate: milestoneDueDate(g, m) }))
  );

  const byDueDate = (a, b) => (a.dueDate?.getTime() || Infinity) - (b.dueDate?.getTime() || Infinity);

  const overdue = all.filter((m) => m.status === "overdue").sort(byDueDate);
  if (overdue.length) return overdue[0];

  const dueThisWeek = all.filter((m) => m.status === "due-this-week").sort(byDueDate);
  if (dueThisWeek.length) return dueThisWeek[0];

  const upcoming = all.filter((m) => m.status === "upcoming").sort(byDueDate);
  return upcoming[0] || null;
}

export function daysOverdue(milestone) {
  if (!milestone.dueDate) return 0;
  return Math.max(0, Math.floor((Date.now() - milestone.dueDate.getTime()) / DAY_MS));
}

/**
 * Turns findMostUrgentMilestone()'s result into the copy shown to the
 * person — extracted so Home's "Today" card and the app-wide reminder
 * banner say the exact same thing from the exact same call, instead of
 * two components independently formatting the same data.
 */
export function describeUrgentMilestone(urgent, { checkedInToday } = {}) {
  if (!urgent) {
    return checkedInToday
      ? { primary: "All milestones complete on this goal." }
      : { primary: "Check in to keep your streak alive.", secondary: "All caught up on milestones." };
  }
  if (urgent.status === "overdue") {
    const days = daysOverdue(urgent);
    return { primary: urgent.title, secondary: `${days} day${days === 1 ? "" : "s"} overdue · "${urgent.goalTitle}"`, urgency: "overdue" };
  }
  if (urgent.status === "due-this-week") {
    return { primary: urgent.title, secondary: `Due this week · "${urgent.goalTitle}"`, urgency: "due" };
  }
  return { primary: urgent.title, secondary: `Part of "${urgent.goalTitle}"` };
}

/**
 * Suppression is keyed by (milestone id, calendar day), not a fixed time
 * gap: the same urgent milestone won't re-appear after being shown once
 * today, but a NEW milestone becoming most urgent (e.g. something else
 * just went overdue) is eligible immediately, and the same milestone is
 * eligible again the next day if it's still incomplete. findMostUrgentMilestone()
 * remains the only place priority is decided — this only decides whether
 * to surface that result again right now.
 */
export function shouldShowReminder(urgent, reminderState) {
  if (!urgent) return false;
  const today = new Date().toISOString().slice(0, 10);
  if (!reminderState) return true;
  const alreadyShownToday = reminderState.milestoneId === urgent.id && reminderState.shownOn === today;
  return !alreadyShownToday;
}
