import { useMemo } from "react";

export function useHabits(goals = []) {
  return useMemo(() => goals.flatMap((g) => g.habits || []), [goals]);
}
