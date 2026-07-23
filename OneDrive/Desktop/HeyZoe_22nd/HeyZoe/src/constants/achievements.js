export const ACHIEVEMENT_CATALOG = [
  { id: "goal-starter", label: "Goal Starter", rule: (m) => m.goalsCount >= 1, metric: "goalsCount", target: 1, desc: "Created your first meaningful goal.", hint: "Create one goal from any life area." },
  { id: "goal-builder", label: "Goal Builder", rule: (m) => m.goalsCount >= 5, metric: "goalsCount", target: 5, desc: "Built a strong portfolio of goals.", hint: "Grow to 5 active goals across life areas." },
  { id: "milestone-sprinter", label: "Milestone Sprinter", rule: (m) => m.doneMilestones >= 10, metric: "doneMilestones", target: 10, desc: "Completed 10 milestones.", hint: "Complete 10 milestones in total." },
  { id: "deep-consistency", label: "Deep Consistency", rule: (m) => m.consistencyScore >= 80, metric: "consistencyScore", target: 80, desc: "Reached elite consistency score.", hint: "Keep streaks and finish daily tasks for 80+ consistency." },
  { id: "streak-master", label: "Streak Master", rule: (m) => m.streak >= 14, metric: "streak", target: 14, desc: "Held a 14-day consistency streak.", hint: "Check in daily until you hit a 14-day streak." },
  { id: "level-climber", label: "Level Climber", rule: (m) => m.level >= 5, metric: "level", target: 5, desc: "Reached level 5.", hint: "Earn XP through milestones and check-ins." },
];
