import { useMemo } from "react";

export function useFinance(goals = []) {
  return useMemo(() => goals.filter((g) => g.categoryId === "finances"), [goals]);
}
