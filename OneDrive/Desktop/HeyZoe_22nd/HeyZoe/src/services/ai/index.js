import { httpsCallable } from "firebase/functions";
import { functions, isFirebaseConfigured } from "../firebase";

async function askClaude(system, user) {
  if (!isFirebaseConfigured) {
    // No Firebase project wired up yet — skip straight to the fallback
    // instead of making a network call that's guaranteed to fail.
    throw new Error("Firebase not configured");
  }
  const askZoe = httpsCallable(functions, "askZoe");
  const { data } = await askZoe({ system, user });
  const clean = (data.text || "").replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

function fallbackGoal(categoryLabel, aspiration, horizon) {
  return {
    title: aspiration.length > 60 ? aspiration.slice(0, 57) + "..." : aspiration,
    specific: `Turn "${aspiration}" into a concrete ${categoryLabel.toLowerCase()} goal with weekly focus.`,
    measurable: "Track progress weekly against 3 key milestones.",
    timeline: `${horizon} months`,
    milestones: [
      { title: "Define your baseline and success metric", weekDue: 1 },
      { title: "Complete first major step", weekDue: Math.round(horizon * 2) },
      { title: "Mid-point check-in and course correction", weekDue: Math.round(horizon * 4.3) },
      { title: "Reach the target outcome", weekDue: Math.round(horizon * 4.3 * 2) },
    ],
    habits: ["Spend 20 min/day on this goal", "Weekly progress log every Sunday"],
    firstSprintFocus: "Get your baseline established and take the first concrete action.",
    encouragement: "This is a strong starting point - small consistent steps will get you there.",
  };
}

export async function zoeGenerateGoal(categoryLabel, aspiration, horizon) {
  const system = `You are Zoe, the AI planning coach inside "Hey Zoe" - an app that helps people turn broad life aspirations into SMART goals across a ${horizon}-month planning horizon. Respond ONLY with raw JSON (no markdown fences, no prose) matching exactly this shape:\n{"title": string (short goal title, max 8 words), "specific": string (1 sentence), "measurable": string (1 sentence, the metric), "timeline": string (e.g. "${horizon} months"), "milestones": [{"title": string, "weekDue": number}] (3-5 milestones, weekDue = week number within the ${horizon}-month horizon, increasing), "habits": [string] (2-3 small recurring habits that support this goal), "firstSprintFocus": string (1 sentence - what to focus on in the first 2-week sprint), "encouragement": string (1 warm, short sentence in Zoe's voice)}`;
  const user = `Life category: ${categoryLabel}\nUser's aspiration in their own words: "${aspiration}"\nPlanning horizon: ${horizon} months\n\nConvert this into a SMART goal.`;
  try {
    const result = await askClaude(system, user);
    if (!result.title || !result.milestones) throw new Error("bad shape");
    return result;
  } catch {
    return fallbackGoal(categoryLabel, aspiration, horizon);
  }
}

export async function zoeSprintReview(goalsSummary, answers) {
  const system = `You are Zoe, a warm but direct AI accountability coach inside "Hey Zoe". A user just finished a Life Sprint and answered 5 reflection questions. Respond ONLY with raw JSON (no markdown fences) matching exactly:\n{"summary": string (2 sentences reflecting back what they accomplished), "insight": string (1-2 sentences, the key pattern or blocker you notice), "suggestedAdjustments": [string] (1-3 short, concrete suggestions, may include goal or habit adjustments), "encouragement": string (1 short warm sentence to close)}`;
  const user = `Active goals context: ${goalsSummary}\n\nReflection answers:\n1. What did you accomplish? ${answers.accomplished}\n2. What blocked you? ${answers.blocked}\n3. What should you stop doing? ${answers.stop}\n4. What should you start doing? ${answers.start}\n5. Should any goals be adjusted? ${answers.adjust}`;
  try {
    return await askClaude(system, user);
  } catch {
    return {
      summary: "You made real progress this sprint and stayed engaged with your plan.",
      insight: "Consistency dipped mid-sprint - that's the most common place momentum slips.",
      suggestedAdjustments: ["Shrink one habit so it takes under 5 minutes", "Block a fixed daily time for your top goal"],
      encouragement: "Every sprint you show up for compounds. Keep going.",
    };
  }
}

export async function zoeLifeReport(goalsSummary, sprintsCompleted, xp) {
  const system = `You are Zoe, the AI coach inside "Hey Zoe". Generate an annual/period "Life Report" for a user. Respond ONLY with raw JSON (no markdown fences) matching exactly:\n{"headline": string (1 short celebratory sentence), "achievements": [string] (3-5 bullet achievements, specific and grounded in the data given), "growthNarrative": string (2-3 sentences on how they grew), "lessons": [string] (2-3 lessons learned), "nextSteps": [string] (2-3 concrete next steps for the coming period)}`;
  const user = `Goals and progress: ${goalsSummary}\nSprints completed: ${sprintsCompleted}\nTotal XP earned: ${xp}\n\nGenerate the Life Report.`;
  try {
    return await askClaude(system, user);
  } catch {
    return {
      headline: "A period of real, measurable growth.",
      achievements: ["Set and worked consistently toward multiple SMART goals", "Completed several Life Sprints", "Built new supporting habits"],
      growthNarrative: "You moved from broad intentions to concrete action, building the muscle of consistent follow-through across your priorities.",
      lessons: ["Progress compounds more from consistency than intensity", "Naming blockers early prevents them from repeating"],
      nextSteps: ["Raise the bar on your strongest category", "Address the goal that stalled most this period"],
    };
  }
}
