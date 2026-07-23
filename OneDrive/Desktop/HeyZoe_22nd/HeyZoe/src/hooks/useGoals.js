import { useMemo } from "react";

export function useGoals(goals = []) {
  return useMemo(() => {
    const total = goals.length;
    const totalMilestones = goals.reduce((sum, g) => sum + g.milestones.length, 0);
    const completedMilestones = goals.reduce((sum, g) => sum + g.milestones.filter((m) => m.done).length, 0);
    return { total, totalMilestones, completedMilestones };
  }, [goals]);
}
