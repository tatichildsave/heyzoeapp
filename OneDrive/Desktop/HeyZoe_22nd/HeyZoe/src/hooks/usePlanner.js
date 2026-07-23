import { useMemo } from "react";

export function usePlanner(goals = [], sprint = null) {
  return useMemo(() => {
    const activeSprint = !!sprint;
    const activeGoals = goals.filter((g) => g.milestones.some((m) => !m.done)).length;
    return { activeSprint, activeGoals };
  }, [goals, sprint]);
}
