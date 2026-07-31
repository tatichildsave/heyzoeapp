import React, { useState } from "react";
import { WelcomeScreen } from "./OnboardingScreens";
import { FocusScreen } from "./FocusScreen";
import { GoalBuilderScreen } from "./GoalBuilderScreen";

const DEFAULT_HORIZON = 6; // months — sensible default; changeable later from You > Settings

/**
 * Replaces the old 7-screen onboarding (Welcome, Mode, Partner, Horizon,
 * Intelligent Profile, Categories, Summary) with a 3-step path that ends
 * in one real, finished goal:
 *   Welcome -> pick one focus area -> Zoe drafts your first goal
 * Mode (solo/couple) and horizon get sensible defaults and live in
 * Settings for anyone who wants to change them later.
 */
export function SimpleOnboarding({ onComplete }) {
  const [stage, setStage] = useState("welcome"); // welcome | focus | goal
  const [categoryId, setCategoryId] = useState(null);
  const [name, setName] = useState("");

  if (stage === "welcome") {
    return <WelcomeScreen name={name} setName={setName} onNext={() => setStage("focus")} />;
  }

  if (stage === "focus") {
    return (
      <FocusScreen
        selected={categoryId}
        onSelect={setCategoryId}
        onNext={() => setStage("goal")}
      />
    );
  }

  return (
    <GoalBuilderScreen
      categoryId={categoryId}
      horizon={DEFAULT_HORIZON}
      mode="individual"
      shared={false}
      setShared={() => {}}
      onBack={() => setStage("focus")}
      onFindExpert={() => {}}
      showDurationPicker={false}
      onDone={(goal) => onComplete(goal, name.trim())}
    />
  );
}
