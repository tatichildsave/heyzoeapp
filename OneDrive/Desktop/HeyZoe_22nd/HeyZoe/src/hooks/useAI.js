import { useCallback } from "react";
import { zoeGenerateGoal, zoeLifeReport, zoeSprintReview } from "../services/ai";

export function useAI() {
  const generateGoal = useCallback((categoryLabel, aspiration, horizon) => zoeGenerateGoal(categoryLabel, aspiration, horizon), []);
  const sprintReview = useCallback((goalsSummary, answers) => zoeSprintReview(goalsSummary, answers), []);
  const lifeReport = useCallback((goalsSummary, sprintsCompleted, xp) => zoeLifeReport(goalsSummary, sprintsCompleted, xp), []);

  return { generateGoal, sprintReview, lifeReport };
}
