import React, { useMemo, useState } from "react";
import { CheckCircle2, Circle, Flame, Snowflake } from "lucide-react";
import { T } from "../../theme";
import { catColor } from "../../constants";
import { Btn, Card } from "../common/Primitives";
import { CatBadge, ProgressRing, ZoeAvatar } from "../common/Visuals";
import { computeGameMetrics } from "../../utils/gamification";

function greeting(name) {
  const h = new Date().getHours();
  const base = h < 5 ? "Still up" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return name ? `${base}, ${name}` : base;
}

function buildNudge({ goals, streak, checkedInToday }) {
  if (goals.length === 0) {
    return { primary: "Set your first goal to get moving.", secondary: "Head to Goals to start." };
  }
  const nextGoal = goals.find((g) => (g.milestones || []).some((m) => !m.done)) || goals[0];
  const nextMilestone = (nextGoal.milestones || []).find((m) => !m.done);
  if (!checkedInToday) {
    return {
      primary: nextMilestone ? nextMilestone.title : "Check in to keep your streak alive.",
      secondary: `Part of "${nextGoal.title}"`,
    };
  }
  return {
    primary: `Nice — day ${streak} done.`,
    secondary: nextMilestone ? `Next up: ${nextMilestone.title}` : "All milestones complete on this goal.",
  };
}

// Small checkbox row used for sprint milestones. Pops on completion via a
// short-lived local "justToggled" flag — no need to touch global state for
// an animation nobody outside this row cares about.
function MilestoneRow({ m, onToggle }) {
  const [justToggled, setJustToggled] = useState(false);
  const handleClick = () => {
    if (!m.done) setJustToggled(true);
    onToggle();
  };
  return (
    <Card
      onClick={handleClick}
      padding={14}
      style={{ display: "flex", alignItems: "center", gap: 10, borderLeft: `4px solid ${catColor(m.categoryId) || T.hairlineSoft}` }}
    >
      <span
        style={{ display: "inline-flex", animation: justToggled ? "popScale .35s ease" : "none" }}
        onAnimationEnd={() => setJustToggled(false)}
      >
        {m.done ? <CheckCircle2 size={19} color={T.sage} /> : <Circle size={19} color={T.mutedSoft} />}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: T.font, fontSize: 14, color: T.ink, textDecoration: m.done ? "line-through" : "none", transition: "color .3s ease" }}>{m.title}</div>
        <div style={{ fontFamily: T.font, fontSize: 11, color: T.mutedSoft }}>{m.goalTitle}</div>
      </div>
    </Card>
  );
}

/**
 * Merges what used to be two separate tabs (Home dashboard + Sprint check-in)
 * into a single focus screen: one goal, one next step, one action.
 *
 * Motion: the "Today" card pulses and a "+10 XP" chip floats up on check-in,
 * milestone checkboxes pop when ticked. These are deliberately small and
 * local — the big confetti/modal moment (see Celebration.jsx) is reserved
 * for level-ups and badges so it doesn't wear thin from daily use.
 */
export function Home({ state, checkedInToday, checkInToday, startNewSprint, toggleMilestone, goToGoals, onEndSprint, onOpenGoal }) {
  const { goals, xp, streak, streakFreezes, sprint } = state;
  const metrics = useMemo(() => computeGameMetrics({ goals, streak, xp }), [goals, streak, xp]);
  const nudge = buildNudge({ goals, streak, checkedInToday });
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  const handleCheckIn = () => {
    setJustCheckedIn(true);
    checkInToday();
  };

  const activeMilestones = sprint
    ? goals
        .flatMap((g) => (g.milestones || []).map((m) => ({ ...m, goalTitle: g.title, categoryId: g.categoryId, goalId: g.id })))
        .filter((m) => sprint.milestoneIds.includes(m.id))
    : [];

  return (
    <div style={{ padding: "20px 20px 100px", overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ZoeAvatar size={40} mood={checkedInToday ? "celebrate" : "idle"} glow={checkedInToday} />
          <div>
            <div style={{ fontFamily: T.font, fontSize: 18, fontWeight: 700, color: T.ink, letterSpacing: -0.3 }}>{greeting(state.name)}</div>
            <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted }}>Level {metrics.level} · {metrics.xpToNextLevel} XP to next</div>
          </div>
        </div>
        <ProgressRing value={metrics.levelProgressPct} size={48} stroke={5} label={`${metrics.level}`} color={T.gold} />
      </div>

      <div
        style={{
          marginTop: 18,
          borderRadius: T.rLg,
          padding: 18,
          position: "relative",
          overflow: "hidden",
          background: `radial-gradient(120% 140% at 100% 0%, ${T.goldSoft} 0%, ${T.canvas} 62%)`,
          border: `1px solid ${T.hairlineSoft}`,
          animation: justCheckedIn ? "pulseGlow .8s ease" : "none",
        }}
        onAnimationEnd={() => setJustCheckedIn(false)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Flame size={16} color={T.gold} />
          <span style={{ fontFamily: T.font, fontSize: 12, fontWeight: 700, color: "#7a5424", textTransform: "uppercase", letterSpacing: 0.5 }}>Today</span>
        </div>
        <div style={{ fontFamily: T.font, fontSize: 20, fontWeight: 700, color: T.ink, marginBottom: 4, letterSpacing: -0.3, lineHeight: 1.25 }}>{nudge.primary}</div>
        <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted, marginBottom: 16 }}>{nudge.secondary}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
          <Btn size="sm" disabled={checkedInToday || goals.length === 0} onClick={handleCheckIn}>
            {checkedInToday ? "Checked in ✓" : "Check in"}
          </Btn>
          <span style={{ fontFamily: T.font, fontSize: 12, color: T.mutedSoft, display: "flex", alignItems: "center", gap: 4 }}>
            <Flame size={12} color={T.gold} /> {streak} day{streak === 1 ? "" : "s"}
            {streakFreezes > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 6 }} title="Streak freezes — forgive one missed day">
                <Snowflake size={11} color="#3d7599" /> {streakFreezes}
              </span>
            )}
          </span>
          {justCheckedIn && (
            <span style={{
              position: "absolute", left: 0, top: -6, fontFamily: T.font, fontSize: 13, fontWeight: 700, color: T.gold,
              animation: "floatUpFade 1.2s ease forwards", pointerEvents: "none",
            }}>
              +10 XP
            </span>
          )}
        </div>
      </div>

      {!sprint && goals.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <Btn full variant="secondary" onClick={() => startNewSprint(14)}>Start a 2-week focus sprint</Btn>
        </div>
      )}

      {sprint && (
        <div style={{ marginTop: 22 }}>
          <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 10 }}>This sprint</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activeMilestones.map((m) => (
              <MilestoneRow key={m.id} m={m} onToggle={() => toggleMilestone(m.goalId, m.id)} />
            ))}
            {activeMilestones.length === 0 && (
              <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted }}>No milestones fall in this sprint window.</div>
            )}
          </div>
          <div style={{ marginTop: 12 }}>
            <Btn full variant="ghost" onClick={onEndSprint}>End sprint & review</Btn>
          </div>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 600, color: T.ink }}>Your goals</div>
          <button onClick={goToGoals} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: T.font, fontSize: 13, color: T.muted }}>See all</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {goals.slice(0, 3).map((g) => {
            const doneM = (g.milestones || []).filter((m) => m.done).length;
            const pct = g.milestones?.length ? Math.round((doneM / g.milestones.length) * 100) : 0;
            const accent = catColor(g.categoryId) || T.hairlineSoft;
            return (
              <Card key={g.id} onClick={() => onOpenGoal(g.id)} padding={14} style={{ display: "flex", alignItems: "center", gap: 10, borderLeft: `4px solid ${accent}` }}>
                <CatBadge id={g.categoryId} size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.ink }}>{g.title}</div>
                  <div style={{ height: 5, backgroundColor: T.hairlineSoft, borderRadius: T.rFull, overflow: "hidden", marginTop: 6 }}>
                    <div style={{ height: "100%", width: `${pct}%`, backgroundColor: accent, borderRadius: T.rFull, transition: "width .5s ease" }} />
                  </div>
                </div>
                <span style={{ fontFamily: T.font, fontSize: 12, color: T.mutedSoft }}>{pct}%</span>
              </Card>
            );
          })}
          {goals.length === 0 && (
            <Card padding={20} style={{ textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center" }}><ZoeAvatar size={36} mood="thinking" /></div>
              <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted, marginTop: 10 }}>No goals yet — add one from the Goals tab.</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
