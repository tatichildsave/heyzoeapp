import { useEffect, useMemo, useRef, useState } from "react";
import { useAppState, useCouple, useExperts, usePushReminders } from "./hooks";
import { useViewport } from "./components/common/Visuals";
import { AppFrame, BottomNav, Sidebar } from "./components/common/LayoutNav";
import { Celebration } from "./components/common/Celebration";
import { ReminderBanner } from "./components/common/ReminderBanner";
import { SimpleOnboarding, GoalBuilderScreen } from "./components/onboarding";
import { Home } from "./components/dashboard";
import { GoalsScreen, GoalDetailScreen } from "./components/goals";
import { ProfileScreen } from "./components/settings";
import { CoupleSetupScreen, UsScreen } from "./components/couple";
import { ExpertsScreen, ExpertProfileScreen, BecomeExpertScreen, ExpertDashboardScreen } from "./components/experts";
import { LifeReportScreen } from "./components/report";
import { SprintReviewScreen } from "./components/planner";
import { FeedbackScreen } from "./components/feedback";
import { registerServiceWorker } from "./services/pwa";
import { trackEvent, trackScreenView, setAnalyticsUser } from "./services/analytics";
import { findMostUrgentMilestone, shouldShowReminder } from "./utils/milestones";

// Gives every milestone a stable id — the AI/fallback goal generator
// returns milestones without ids, but toggling progress needs one.
// Also stamps createdAt, which anchors each milestone's relative
// "weekDue" to an actual calendar date (see utils/milestones.js).
function withMilestoneIds(goal) {
  return {
    ...goal,
    createdAt: goal.createdAt || new Date().toISOString(),
    milestones: (goal.milestones || []).map((m, i) => ({ ...m, id: m.id || `${goal.id || goal.categoryId}-m${i}`, done: !!m.done })),
  };
}

export default function App() {
  const {
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
  } = useAppState();

  // Registered here (not just inside the You-screen install hook) so it's
  // active on first load — install eligibility and offline caching
  // shouldn't depend on which tab someone happens to open first.
  useEffect(() => {
    registerServiceWorker();
  }, []);

  const couple = useCouple(state.goals);
  const experts = useExperts();
  const reminders = usePushReminders(couple.uid);

  useEffect(() => {
    if (couple.uid) setAnalyticsUser(couple.uid);
  }, [couple.uid]);

  const frameRef = useRef(null);
  const { device } = useViewport(frameRef);
  const [addingGoalFor, setAddingGoalFor] = useState(null); // categoryId while adding a goal from Goals tab
  const [newGoalShared, setNewGoalShared] = useState(false);
  // "couple-setup" | "us" | "experts" | "expert-profile" | "become-expert" | "expert-dashboard" | "life-report" | "sprint-review" | "feedback" | null
  const [secondaryView, setSecondaryView] = useState(null);
  const [expertCategoryFilter, setExpertCategoryFilter] = useState(null);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [viewingGoalId, setViewingGoalId] = useState(null);

  // findMostUrgentMilestone stays the one place priority is decided (see
  // utils/milestones.js); shouldShowReminder only decides whether to
  // surface that same result again right now (day+milestone-aware, not a
  // fixed time gap).
  const urgentMilestone = useMemo(() => findMostUrgentMilestone(state.goals), [state.goals]);
  const showReminderBanner = state.onboardingDone && !addingGoalFor && !secondaryView && !viewingGoalId && shouldShowReminder(urgentMilestone, state.inAppReminder);

  const currentView = !loaded
    ? null // nothing to log yet — still loading local state
    : !state.onboardingDone
    ? "onboarding"
    : addingGoalFor
    ? "goal-builder"
    : secondaryView
    ? secondaryView
    : viewingGoalId
    ? "goal-detail"
    : `tab-${state.tab}`;

  useEffect(() => {
    if (currentView) trackScreenView(currentView);
  }, [currentView]);

  if (!loaded) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading Hey Zoe...</div>;
  }

  if (!state.onboardingDone) {
    return (
      <AppFrame device={device} frameRef={frameRef}>
        <SimpleOnboarding onComplete={(goal, name) => {
          trackEvent("onboarding_complete", { category_id: goal.categoryId });
          completeOnboarding(withMilestoneIds(goal), name);
        }} />
      </AppFrame>
    );
  }

  if (addingGoalFor) {
    return (
      <AppFrame device={device} frameRef={frameRef}>
        <GoalBuilderScreen
          categoryId={addingGoalFor}
          horizon={state.horizon}
          mode={couple.profile.mode}
          shared={newGoalShared}
          setShared={setNewGoalShared}
          onBack={() => { setAddingGoalFor(null); setNewGoalShared(false); }}
          onFindExpert={() => {
            setExpertCategoryFilter(addingGoalFor);
            setAddingGoalFor(null);
            setNewGoalShared(false);
            setSecondaryView("experts");
          }}
          onDone={(goal) => {
            const shared = couple.profile.mode === "couple" ? newGoalShared : false;
            trackEvent("goal_created", { category_id: addingGoalFor, shared });
            addGoal(withMilestoneIds({ ...goal, shared }));
            setAddingGoalFor(null);
            setNewGoalShared(false);
          }}
        />
      </AppFrame>
    );
  }

  if (secondaryView === "couple-setup") {
    return (
      <AppFrame device={device} frameRef={frameRef}>
        <CoupleSetupScreen uid={couple.uid} profile={couple.profile} onBack={() => setSecondaryView(null)} />
      </AppFrame>
    );
  }

  if (secondaryView === "us") {
    return (
      <AppFrame device={device} frameRef={frameRef}>
        <UsScreen goals={state.goals} partnerGoals={couple.partnerGoals} partnerName={couple.profile.partnerName} onBack={() => setSecondaryView(null)} />
      </AppFrame>
    );
  }

  if (secondaryView === "experts") {
    return (
      <AppFrame device={device} frameRef={frameRef}>
        <ExpertsScreen
          experts={experts.experts}
          categoryFilter={expertCategoryFilter}
          onBack={() => { setSecondaryView(null); setExpertCategoryFilter(null); }}
          onOpenExpert={(ex) => { setSelectedExpert(ex); setSecondaryView("expert-profile"); }}
        />
      </AppFrame>
    );
  }

  if (secondaryView === "expert-profile" && selectedExpert) {
    return (
      <AppFrame device={device} frameRef={frameRef}>
        <ExpertProfileScreen
          expert={selectedExpert}
          onBack={() => setSecondaryView("experts")}
          onBooked={async (ex) => {
            trackEvent("expert_booked", { expert_id: ex.id });
            await experts.bookExpert(ex.id);
            addXp(20);
          }}
        />
      </AppFrame>
    );
  }

  if (secondaryView === "become-expert") {
    return (
      <AppFrame device={device} frameRef={frameRef}>
        <BecomeExpertScreen
          existingProfile={experts.myProfile}
          onBack={() => setSecondaryView(experts.myProfile ? "expert-dashboard" : null)}
          onSaved={async (profile) => {
            const isNew = !experts.myProfile;
            await experts.publishProfile(profile);
            trackEvent(isNew ? "expert_profile_published" : "expert_profile_updated");
            setSecondaryView("expert-dashboard");
          }}
        />
      </AppFrame>
    );
  }

  if (secondaryView === "expert-dashboard" && experts.myProfile) {
    return (
      <AppFrame device={device} frameRef={frameRef}>
        <ExpertDashboardScreen
          profile={experts.myProfile}
          bookingCount={experts.myBookingCount}
          onBack={() => setSecondaryView(null)}
          onEdit={() => setSecondaryView("become-expert")}
        />
      </AppFrame>
    );
  }

  if (secondaryView === "life-report") {
    return (
      <AppFrame device={device} frameRef={frameRef}>
        <LifeReportScreen state={state} report={state.report} onGenerated={setReport} onBack={() => setSecondaryView(null)} />
      </AppFrame>
    );
  }

  if (secondaryView === "sprint-review") {
    return (
      <AppFrame device={device} frameRef={frameRef}>
        <SprintReviewScreen
          goals={state.goals}
          onBack={() => setSecondaryView(null)}
          onComplete={() => {
            completeSprint();
            setSecondaryView(null);
          }}
        />
      </AppFrame>
    );
  }

  if (secondaryView === "feedback") {
    return (
      <AppFrame device={device} frameRef={frameRef}>
        <FeedbackScreen uid={couple.uid} onBack={() => setSecondaryView(null)} />
      </AppFrame>
    );
  }

  const viewingGoal = viewingGoalId ? state.goals.find((g) => g.id === viewingGoalId) : null;
  if (viewingGoal) {
    return (
      <AppFrame device={device} frameRef={frameRef}>
        <GoalDetailScreen
          goal={viewingGoal}
          onBack={() => setViewingGoalId(null)}
          toggleMilestone={(milestoneId) => toggleMilestone(viewingGoal.id, milestoneId)}
          checkInHabit={(habitId) => checkInHabit(viewingGoal.id, habitId)}
          addNote={(text) => addGoalNote(viewingGoal.id, text)}
          onDelete={() => {
            deleteGoal(viewingGoal.id);
            setViewingGoalId(null);
          }}
        />
      </AppFrame>
    );
  }

  const isDesktop = device === "desktop";

  let content;
  if (state.tab === "goals") {
    content = <GoalsScreen goals={state.goals} openGoalBuilder={setAddingGoalFor} toggleMilestone={toggleMilestone} onOpenGoal={setViewingGoalId} />;
  } else if (state.tab === "you") {
    content = (
      <ProfileScreen
        state={state}
        resetApp={resetApp}
        coupleProfile={couple.profile}
        onOpenCouple={() => setSecondaryView(couple.profile.mode === "couple" ? "us" : "couple-setup")}
        onOpenExperts={() => { setExpertCategoryFilter(null); setSecondaryView("experts"); }}
        onOpenMyExpertProfile={() => setSecondaryView(experts.myProfile ? "expert-dashboard" : "become-expert")}
        hasExpertProfile={!!experts.myProfile}
        onOpenLifeReport={() => setSecondaryView("life-report")}
        onOpenFeedback={() => setSecondaryView("feedback")}
        remindersEnabled={reminders.enabled}
        reminderStatus={reminders.status}
        onEnableReminders={reminders.enable}
        onDisableReminders={reminders.disable}
      />
    );
  } else {
    content = (
      <Home
        state={state}
        checkedInToday={checkedInToday}
        checkInToday={checkInToday}
        startNewSprint={startNewSprint}
        toggleMilestone={toggleMilestone}
        goToGoals={() => setTab("goals")}
        onEndSprint={() => setSecondaryView("sprint-review")}
        onOpenGoal={setViewingGoalId}
      />
    );
  }

  return (
    <AppFrame device={device} frameRef={frameRef}>
      <div style={{ display: "flex", height: "100%" }}>
        {isDesktop && <Sidebar tab={state.tab} setTab={setTab} />}
        <div style={{ flex: 1, position: "relative", height: "100%" }}>
          {content}
          {!isDesktop && <BottomNav tab={state.tab} setTab={setTab} />}
          {showReminderBanner && (
            <ReminderBanner
              urgent={urgentMilestone}
              onOpen={() => {
                markReminderShown(urgentMilestone.id);
                setViewingGoalId(urgentMilestone.goalId);
              }}
              onDismiss={() => markReminderShown(urgentMilestone.id)}
            />
          )}
          <Celebration celebration={celebration} onDone={clearCelebration} />
        </div>
      </div>
    </AppFrame>
  );
}
