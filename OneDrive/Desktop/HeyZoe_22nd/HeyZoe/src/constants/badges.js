import { Target, Flame, Trophy, BookOpen, Star } from "lucide-react";

export const BADGES_CATALOG = [
  { id: "first-goal", label: "First Goal Set", icon: Target, xp: 50 },
  { id: "streak-3", label: "3-Day Streak", icon: Flame, xp: 30 },
  { id: "streak-7", label: "7-Day Streak", icon: Flame, xp: 75 },
  { id: "sprint-1", label: "Sprint Finisher", icon: Trophy, xp: 100 },
  { id: "reflect-1", label: "Reflection Master", icon: BookOpen, xp: 60 },
  { id: "milestone-5", label: "5 Milestones Hit", icon: Star, xp: 80 },
];
