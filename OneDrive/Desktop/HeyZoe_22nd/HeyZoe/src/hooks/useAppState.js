import { useEffect, useRef, useState } from "react";
import { ensureStorage } from "../utils/storage";
import { todayStr } from "../utils/dates";
import { BADGES_CATALOG } from "../constants";
import { getLevelProgress } from "../utils/gamification";
import { trackEvent } from "../services/analytics";

const DEFAULT_HABITS = ["Spend 20 min/day on this goal", "Weekly progress log every Sunday"];

// Calculate current day of the sprint based on startedAt date
// Uses same date handling as todayStr() for consistency (ISO string YYYY-MM-DD)
export function getDayOfSprint(sprint) {
  if (!sprint || !sprint.startedAt) return 1;
  const today = new Date(todayStr());
  const started = new Date(sprint.startedAt);
  const daysSinceStart = Math.floor((today - started) / 86400000); // milliseconds per day
  return Math.max(1, Math.min(sprint.lengthDays, daysSinceStart + 1));
}

// Goals saved before habit-tracking existed have `habits` as plain strings
// (or missing entirely) — this turns them into checkable objects so the
// goal detail screen works retroactively without forcing a goal rebuild.
function withHabitIds(goal) {
  const source = goal.habits && goal.habits.length ? goal.habits : DEFAULT_HABITS;
  return {
    ...goal,
    habits: source.map((h, i) => (typeof h === "string" ? { id: `${goal.id || goal.categoryId}-h${i}`, title: h, lastCheckIn: null, streak: 0 } : h)),
  };
}

// Goals saved before milestone due-dates existed have no createdAt to
// anchor "week 12" to an actual date. Backfilling it to "now" (rather
// than guessing a past date) means nothing suddenly looks overdue the
// moment this ships — the milestone clock just starts today for them.
function withCreatedAt(goal) {
  return { ...goal, createdAt: goal.createdAt || new Date().toISOString() };
}

const STORAGE_KEY = "heyzoe:v2:state";

const MAX_STREAK_FREEZES = 3;

const DEFAULT_STATE = {
  onboardingDone: false,
  tab: "home",
  mode: "individual",
  horizon: 6,
  name: "",
  goals: [],
  xp: 0,
  streak: 0,
  streakFreezes: 1, // everyone starts with one, so the first miss teaches the mechanic instead of just resetting silently
  lastCheckIn: null,
  badges: [],
  sprint: null,
  sprintsCompleted: 0,
  report: null,
  inAppReminder: { milestoneId: null, shownOn: null },
};

/**
 * Central state for the simplified Hey Zoe experience.
 * Persists to window.storage (polyfilled to localStorage — see utils/storage.js).
 * Intentionally scoped to the "spine" flow: onboarding -> goals -> home check-ins -> profile.
 * Couple mode, expert marketplace, and Life Report are not part of this state slice yet —
 * they're being reintroduced deliberately in a later pass instead of loading on day one.
 */
export function useAppState() {
  ensureStorage();
  const [state, setState] = useState(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [celebration, setCelebration] = useState(null); // transient — never persisted
  const saveTimerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY);
        if (res && res.value) {
          const loadedState = { ...DEFAULT_STATE, ...JSON.parse(res.value) };
          loadedState.goals = loadedState.goals.map((g) => withCreatedAt(withHabitIds(g)));
          setState(loadedState);
        }
      } catch (e) {
        // first run, nothing saved yet
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      window.storage.set(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
    }, 250);
    return () => clearTimeout(saveTimerRef.current);
  }, [state, loaded]);

  const setTab = (tab) => setState((s) => ({ ...s, tab }));
  const clearCelebration = () => setCelebration(null);

  const awardBadge = (s, badgeId) => {
    if (s.badges.includes(badgeId)) return s;
    const badge = BADGES_CATALOG.find((b) => b.id === badgeId);
    return { ...s, badges: [...s.badges, badgeId], xp: s.xp + (badge?.xp || 0) };
  };

  // Applies a fully-built next state, then decides whether this action
  // deserves a global celebration by diffing against the state that was
  // current before the action. Priority: level-up > badge > whatever
  // fallback celebration the caller passed (e.g. a streak freeze being
  // used or earned) — so we never stack two overlays for one action.
  const commit = (next, fallbackCelebration = null) => {
    const prevLevel = getLevelProgress(state.xp).level;
    const newLevel = getLevelProgress(next.xp).level;
    const newBadgeIds = next.badges.filter((id) => !state.badges.includes(id));
    setState(next);
    if (newLevel > prevLevel) {
      setCelebration({ type: "levelup", level: newLevel });
      trackEvent("level_up", { level: newLevel });
    } else if (newBadgeIds.length) {
      const badge = BADGES_CATALOG.find((b) => b.id === newBadgeIds[0]);
      if (badge) {
        setCelebration({ type: "badge", badge });
        trackEvent("badge_earned", { badge_id: badge.id });
      }
    } else if (fallbackCelebration) {
      setCelebration(fallbackCelebration);
    }
  };

  // Called once, at the end of the simplified onboarding flow.
  const completeOnboarding = (firstGoal, name) => {
    let next = { ...state, onboardingDone: true, tab: "home", name: name || "", goals: [withCreatedAt(withHabitIds(firstGoal))] };
    next = awardBadge(next, "first-goal");
    commit(next);
  };

  const addGoal = (goal) => {
    let next = { ...state, goals: [...state.goals, withCreatedAt(withHabitIds(goal))] };
    if (next.goals.length >= 5) next = awardBadge(next, "goal-builder");
    commit(next);
  };

  // Awards XP the moment a milestone is marked done (and removes it if
  // un-checked, so toggling back and forth can't be used to farm XP).
  // Also detects the goal itself just hit 100% for the first time — that's
  // a bigger moment than any single milestone, so it gets its own
  // celebration rather than just the usual badge/level-up check.
  const toggleMilestone = (goalId, milestoneId) => {
    const goal = state.goals.find((g) => g.id === goalId);
    const milestone = goal?.milestones.find((m) => m.id === milestoneId);
    if (!goal || !milestone) return;
    const nowDone = !milestone.done;
    const wasComplete = goal.milestones.every((m) => m.done);
    const nextGoals = state.goals.map((g) =>
      g.id !== goalId ? g : { ...g, milestones: g.milestones.map((m) => (m.id === milestoneId ? { ...m, done: nowDone } : m)) }
    );
    const isNowComplete = nextGoals.find((g) => g.id === goalId).milestones.every((m) => m.done);
    let next = { ...state, goals: nextGoals, xp: state.xp + (nowDone ? 30 : -30) };
    let fallbackCelebration = null;
    if (nowDone) {
      const doneCount = nextGoals.flatMap((g) => g.milestones).filter((m) => m.done).length;
      if (doneCount >= 5) next = awardBadge(next, "milestone-5");
      trackEvent("milestone_completed", { goal_id: goalId, category_id: goal.categoryId });
      if (isNowComplete && !wasComplete) {
        next = { ...next, xp: next.xp + 50 };
        fallbackCelebration = { type: "goal-complete", goalTitle: goal.title };
        trackEvent("goal_completed", { goal_id: goalId, category_id: goal.categoryId });
      }
    }
    commit(next, fallbackCelebration);
  };

  const deleteGoal = (goalId) => {
    const goal = state.goals.find((g) => g.id === goalId);
    if (!goal) return; // Safety: goal doesn't exist
    
    const isComplete = goal.milestones?.every((m) => m.done);
    trackEvent("goal_deleted", { goal_id: goalId, category_id: goal?.categoryId, was_complete: !!isComplete });
    
    // Consistency: use commit() like other state-modifying functions
    // This ensures proper state batching and prevents race conditions
    const next = { ...state, goals: state.goals.filter((g) => g.id !== goalId) };
    commit(next);
  };

  const checkedInToday = state.lastCheckIn === todayStr();

  const checkInToday = () => {
    if (checkedInToday) return;

    const daysMissed = (() => {
      if (!state.lastCheckIn) return null; // no prior check-in at all — not a "miss", just a fresh start
      const prev = new Date(state.lastCheckIn);
      return Math.round((new Date(todayStr()) - prev) / 86400000) - 1; // 0 = checked in yesterday, 1 = missed exactly one day, etc.
    })();

    let streak;
    let freezes = state.streakFreezes;
    let fallbackCelebration = null;

    if (daysMissed === 0) {
      streak = state.streak + 1;
    } else if (daysMissed === 1 && freezes > 0) {
      // Missed exactly one day, but a freeze covers it — the streak
      // continues instead of resetting. This is the whole point of the
      // feature: one bad day shouldn't erase weeks of consistency.
      streak = state.streak + 1;
      freezes -= 1;
      fallbackCelebration = { type: "freeze-used", freezesLeft: freezes };
    } else {
      streak = 1;
    }

    // Earn a freeze back every 7-day streak, capped so they can't be
    // banked indefinitely.
    if (streak > 0 && streak % 7 === 0 && freezes < MAX_STREAK_FREEZES) {
      freezes += 1;
      if (!fallbackCelebration) fallbackCelebration = { type: "freeze-earned", freezesLeft: freezes };
    }

    let next = { ...state, lastCheckIn: todayStr(), streak, streakFreezes: freezes, xp: state.xp + 10 };
    if (streak >= 3) next = awardBadge(next, "streak-3");
    if (streak >= 7) next = awardBadge(next, "streak-7");
    trackEvent("check_in", { streak, used_freeze: fallbackCelebration?.type === "freeze-used" });
    commit(next, fallbackCelebration);
  };

  const checkInHabit = (goalId, habitId) => {
    const goal = state.goals.find((g) => g.id === goalId);
    const habit = goal?.habits?.find((h) => h.id === habitId);
    if (!goal || !habit || habit.lastCheckIn === todayStr()) return;
    const wasYesterday = habit.lastCheckIn
      ? Math.round((new Date(todayStr()) - new Date(habit.lastCheckIn)) / 86400000) === 1
      : false;
    const streak = wasYesterday ? habit.streak + 1 : 1;
    const nextGoals = state.goals.map((g) =>
      g.id !== goalId ? g : { ...g, habits: g.habits.map((h) => (h.id === habitId ? { ...h, lastCheckIn: todayStr(), streak } : h)) }
    );
    trackEvent("habit_checked_in", { goal_id: goalId, habit_id: habitId });
    commit({ ...state, goals: nextGoals, xp: state.xp + 5 });
  };

  const addGoalNote = (goalId, text) => {
    const entry = { id: `note-${Date.now()}`, text, at: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }) };
    setState((s) => ({ ...s, goals: s.goals.map((g) => (g.id !== goalId ? g : { ...g, logs: [...(g.logs || []), entry] })) }));
  };

  const startNewSprint = (lengthDays) => {
    trackEvent("sprint_started", { length_days: lengthDays });
    setState((s) => ({
      ...s,
      sprint: {
        lengthDays,
        startedAt: todayStr(),
        focus: s.goals[0]?.firstSprintFocus || "Take one concrete step today.",
        milestoneIds: s.goals.flatMap((g) => (g.milestones || []).filter((m) => !m.done).slice(0, 2).map((m) => m.id)),
      },
    }));
  };

  const completeSprint = () => {
    let next = { ...state, sprint: null, sprintsCompleted: state.sprintsCompleted + 1, xp: state.xp + 25 };
    next = awardBadge(next, "sprint-1");
    trackEvent("sprint_completed");
    commit(next);
  };

  // For actions owned outside this hook (e.g. booking an expert) that
  // should still award XP and be eligible for a level-up celebration.
  const addXp = (amount) => {
    commit({ ...state, xp: state.xp + amount });
  };

  const setReport = (report) => setState((s) => ({ ...s, report }));

  // Records that the in-app reminder banner was shown/dismissed for this
  // milestone today — see shouldShowReminder() in utils/milestones.js for
  // how this is read. Plain bookkeeping, not a celebration, so it goes
  // straight through setState rather than commit().
  const markReminderShown = (milestoneId) => {
    setState((s) => ({ ...s, inAppReminder: { milestoneId, shownOn: new Date().toISOString().slice(0, 10) } }));
  };

  const resetApp = () => {
    window.storage.delete(STORAGE_KEY).catch(() => {});
    setState(DEFAULT_STATE);
  };

  return {
    state,
    loaded,
    setTab,
    completeOnboarding,
    addGoal,
    toggleMilestone,
    deleteGoal,
    checkedInToday,
    checkInToday,
    checkInHabit,
    addGoalNote,
    startNewSprint,
    completeSprint,
    addXp,
    setReport,
    markReminderShown,
    resetApp,
    celebration,
    clearCelebration,
  };
}
