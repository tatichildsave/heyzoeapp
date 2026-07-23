import { CATEGORIES } from "../constants";

export const xpForLevel = (level) => Math.max(100, 100 + (level - 1) * 120);

export function getLevelProgress(xp) {
  let level = 1;
  let consumed = 0;
  while (xp >= consumed + xpForLevel(level)) {
    consumed += xpForLevel(level);
    level += 1;
    if (level > 100) break;
  }
  const levelFloorXp = consumed;
  const levelSpan = xpForLevel(level);
  const withinLevel = Math.max(0, xp - levelFloorXp);
  const pct = Math.round((withinLevel / levelSpan) * 100);
  return {
    level,
    levelFloorXp,
    levelSpan,
    withinLevel,
    toNextLevel: Math.max(0, levelSpan - withinLevel),
    progressPct: Math.min(100, Math.max(0, pct)),
  };
}

export function computeGameMetrics({ goals = [], streak = 0, xp = 0 }) {
  const allMilestones = goals.flatMap((g) => g.milestones || []);
  const doneMilestones = allMilestones.filter((m) => m.done).length;
  const totalMilestones = allMilestones.length;
  const milestoneRate = totalMilestones ? Math.round((doneMilestones / totalMilestones) * 100) : 0;

  const activeAreas = new Set(goals.map((g) => g.categoryId));
  const areaCoverage = Math.round((activeAreas.size / CATEGORIES.length) * 100);

  const streakScore = Math.min(100, streak * 6);
  const consistencyScore = Math.round(streakScore * 0.6 + milestoneRate * 0.4);
  const lifeScore = Math.round(milestoneRate * 0.4 + areaCoverage * 0.35 + consistencyScore * 0.25);

  const levelData = getLevelProgress(xp);
  return {
    level: levelData.level,
    levelProgressPct: levelData.progressPct,
    xpToNextLevel: levelData.toNextLevel,
    consistencyScore,
    lifeScore,
    doneMilestones,
    totalMilestones,
    milestoneRate,
    goalsCount: goals.length,
    streak,
  };
}

export function achievementProgress(achievement, metrics) {
  const metricValue = Number(metrics?.[achievement.metric] || 0);
  const target = Number(achievement.target || 1);
  const value = Math.max(0, Math.min(metricValue, target));
  const pct = Math.min(100, Math.round((value / target) * 100));
  return { value, target, pct };
}
