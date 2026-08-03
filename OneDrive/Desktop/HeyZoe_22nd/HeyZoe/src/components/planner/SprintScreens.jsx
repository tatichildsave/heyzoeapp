import React, { useState } from "react";
import { Calendar, CheckCircle2, Circle, RefreshCw, Target, Zap, ChevronRight, X } from "lucide-react";
import { T } from "../../theme";
import { Btn, Card, ScreenHeader } from "../common/Primitives";
import { CategoryIcon, LoadingDots, ZoeAvatar } from "../common/Visuals";
import { zoeSprintReview, QuotaError } from "../../services/ai";
import { getDayOfSprint } from "../../hooks/useAppState";

// Detect if sprint's time window has expired (today > startedAt + lengthDays)
function isSprintExpired(sprint) {
  if (!sprint || !sprint.startedAt) return false;
  const today = new Date(new Date().toISOString().slice(0, 10));
  const started = new Date(sprint.startedAt);
  const daysSinceStart = Math.floor((today - started) / 86400000);
  return daysSinceStart >= sprint.lengthDays;
}

// Component for user to select milestones before starting a sprint
function MilestonePickerStep({ goals, lengthDays, onStart, onCancel }) {
  const MAX_MILESTONES = 5;
  
  // Gather all open milestones with goal context
  const allOpenMilestones = goals
    .flatMap((g) =>
      (g.milestones || [])
        .filter((m) => !m.done)
        .map((m) => ({ ...m, goalTitle: g.title, categoryId: g.categoryId, goalId: g.id }))
    );
  
  const [selected, setSelected] = useState(new Set());
  
  const toggleMilestone = (milestoneId) => {
    const newSelected = new Set(selected);
    if (newSelected.has(milestoneId)) {
      newSelected.delete(milestoneId);
    } else {
      if (newSelected.size < MAX_MILESTONES) {
        newSelected.add(milestoneId);
      }
    }
    setSelected(newSelected);
  };
  
  const groupedByGoal = {};
  allOpenMilestones.forEach((m) => {
    if (!groupedByGoal[m.goalId]) {
      groupedByGoal[m.goalId] = { goalTitle: m.goalTitle, categoryId: m.categoryId, milestones: [] };
    }
    groupedByGoal[m.goalId].milestones.push(m);
  });
  
  const canStart = selected.size > 0;
  
  return (
    <div style={{ padding: "20px 20px 100px", height: "100%", overflowY: "auto" }}>
      <ScreenHeader title="Pick your focus" subtitle={`Select 1–${MAX_MILESTONES} milestones for your ${lengthDays}-day sprint`} onBack={onCancel} />
      
      {allOpenMilestones.length === 0 ? (
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <div style={{ fontFamily: T.font, fontSize: 14, color: T.muted }}>No open milestones. Create one first.</div>
        </div>
      ) : (
        <>
          <div style={{ marginTop: 12 }}>
            {Object.entries(groupedByGoal).map(([goalId, { goalTitle, categoryId, milestones }]) => (
              <div key={goalId} style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: T.font, fontSize: 12, fontWeight: 700, color: T.mutedSoft, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 8 }}>
                  {goalTitle}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {milestones.map((m) => (
                    <Card
                      key={m.id}
                      padding={14}
                      onClick={() => toggleMilestone(m.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        cursor: "pointer",
                        backgroundColor: selected.has(m.id) ? T.surfaceHover : "transparent",
                        border: selected.has(m.id) ? `2px solid ${T.primary}` : `1px solid ${T.hairline}`,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(m.id)}
                        onChange={() => {}}
                        style={{ width: 18, height: 18, cursor: "pointer", accentColor: T.primary }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: T.font, fontSize: 14, color: T.ink, fontWeight: selected.has(m.id) ? 600 : 400 }}>
                          {m.title}
                        </div>
                        <div style={{ fontFamily: T.font, fontSize: 11, color: T.muted, marginTop: 2 }}>
                          Week {m.weekDue}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            <Btn
              full
              disabled={!canStart}
              onClick={() => onStart(Array.from(selected))}
            >
              Start {lengthDays}-day sprint ({selected.size} milestone{selected.size === 1 ? "" : "s"})
            </Btn>
          </div>
          
          {selected.size === MAX_MILESTONES && (
            <div style={{ marginTop: 12, fontFamily: T.font, fontSize: 12, color: T.mutedSoft, fontStyle: "italic", textAlign: "center" }}>
              Maximum {MAX_MILESTONES} milestones per sprint
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function SprintScreen({ state, checkInToday, toggleMilestone, startSprintReview, startNewSprint, checkedInToday }) {
  const { sprint, goals } = state;
  const [showMilestonePicker, setShowMilestonePicker] = useState(false);
  const [pendingSprintLength, setPendingSprintLength] = useState(null);

  if (!sprint) {
    if (showMilestonePicker && pendingSprintLength) {
      return (
        <MilestonePickerStep
          goals={goals}
          lengthDays={pendingSprintLength}
          onStart={(milestoneIds) => {
            startNewSprint(pendingSprintLength, milestoneIds);
            setShowMilestonePicker(false);
            setPendingSprintLength(null);
          }}
          onCancel={() => {
            setShowMilestonePicker(false);
            setPendingSprintLength(null);
          }}
        />
      );
    }
    
    return (
      <div style={{ padding: 20, height: "100%", display: "flex", flexDirection: "column" }}>
        <ScreenHeader title="Life Sprints" subtitle="Break your goals into focused 2-4 week sprints." />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center", padding: "0 12px" }}>
          <Target size={36} color={T.mutedSoft} />
          <div style={{ fontFamily: T.font, fontSize: 15, color: T.body }}>No active sprint. Start one to focus on your nearest milestones.</div>
          <Btn onClick={() => { setPendingSprintLength(14); setShowMilestonePicker(true); }}>Start a 2-week sprint</Btn>
          <Btn variant="secondary" onClick={() => { setPendingSprintLength(28); setShowMilestonePicker(true); }}>Start a 4-week sprint</Btn>
        </div>
      </div>
    );
  }

  const allMilestones = goals.flatMap((g) => g.milestones.map((m) => ({ ...m, goalTitle: g.title, categoryId: g.categoryId, goalId: g.id }))).filter((m) => sprint.milestoneIds.includes(m.id));
  const allHabits = goals.flatMap((g) => g.habits.map((h, i) => ({ text: h, goalId: g.id, idx: i })));
  const dayOfSprint = getDayOfSprint(sprint);
  const expired = isSprintExpired(sprint);
  const dayPct = Math.round((dayOfSprint / sprint.lengthDays) * 100);

  return (
    <div style={{ padding: "20px 20px 100px", overflowY: "auto", height: "100%" }}>
      <ScreenHeader title="Current sprint" subtitle={sprint.focus} />
      <Card padding={16} style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: T.font, fontSize: 13, color: T.muted, marginBottom: 8 }}>
          <span>Day {dayOfSprint} of {sprint.lengthDays}</span>
          <span>{expired ? "Sprint window closed" : `${sprint.lengthDays - dayOfSprint} days left`}</span>
        </div>
        <div style={{ height: 8, backgroundColor: T.hairlineSoft, borderRadius: T.rFull, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${dayPct}%`, backgroundColor: T.primary, borderRadius: T.rFull }} />
        </div>
        {expired && (
          <div style={{ marginTop: 12, fontFamily: T.font, fontSize: 12, color: T.muted, fontStyle: "italic" }}>
            Sprint timeline has passed. End & review whenever you're ready.
          </div>
        )}
      </Card>

      <div style={{ marginTop: 20 }}>
        <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 10 }}>Today's check-in</div>
        <Card padding={16} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T.font, fontSize: 14, color: T.ink }}>Mark today complete to build your streak</div>
            <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted, marginTop: 2 }}>+10 XP · streak day {state.streak + (checkedInToday ? 0 : 1)}</div>
          </div>
          <Btn size="sm" disabled={checkedInToday} onClick={checkInToday}>{checkedInToday ? "Done ✓" : "Check in"}</Btn>
        </Card>
      </div>

      <div style={{ marginTop: 20 }}>
        <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 10 }}>Sprint milestones</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {allMilestones.map((m) => (
            <Card key={m.id} padding={14} onClick={() => toggleMilestone(m.goalId, m.id)} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {m.done ? <CheckCircle2 size={19} color={T.primary} /> : <Circle size={19} color={T.mutedSoft} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.font, fontSize: 14, color: T.ink, textDecoration: m.done ? "line-through" : "none" }}>{m.title}</div>
                <div style={{ fontFamily: T.font, fontSize: 11, color: T.mutedSoft }}>{m.goalTitle}</div>
              </div>
            </Card>
          ))}
          {allMilestones.length === 0 && <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted }}>No milestones fall in this sprint window yet.</div>}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 10 }}>Supporting habits</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {allHabits.map((h, i) => (
            <span key={i} style={{ fontFamily: T.font, fontSize: 12, color: T.ink, backgroundColor: T.surfaceSoft, borderRadius: T.rFull, padding: "8px 14px" }}>{h.text}</span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 26 }}>
        <Btn full variant="secondary" icon={ChevronRight} onClick={startSprintReview}>End sprint & review</Btn>
      </div>
    </div>
  );
}

export function SprintReviewScreen({ goals, onBack, onComplete }) {
  const [answers, setAnswers] = useState({ accomplished: "", blocked: "", stop: "", start: "", adjust: "" });
  const [stage, setStage] = useState("form");
  const [result, setResult] = useState(null);
  const [quotaMessage, setQuotaMessage] = useState(null);

  const questions = [
    { key: "accomplished", q: "What did you accomplish?" },
    { key: "blocked", q: "What blocked you?" },
    { key: "stop", q: "What should you stop doing?" },
    { key: "start", q: "What should you start doing?" },
    { key: "adjust", q: "Should any goals be adjusted?" },
  ];
  const allFilled = questions.every((q) => answers[q.key].trim());

  const submit = async () => {
    setStage("loading");
    setQuotaMessage(null);
    const summary = goals.map((g) => `${g.title} (${g.milestones.filter((m) => m.done).length}/${g.milestones.length} milestones done)`).join("; ");
    try {
      const r = await zoeSprintReview(summary, answers);
      setResult(r);
      setStage("result");
    } catch (e) {
      if (e instanceof QuotaError) {
        setQuotaMessage(e.message);
        setStage("form");
      } else {
        throw e;
      }
    }
  };

  return (
    <div style={{ padding: "0 20px 90px", height: "100%", overflowY: "auto" }}>
      <ScreenHeader title="Sprint review" subtitle="Reflect with Zoe before starting your next sprint." onBack={onBack} />
      {stage === "form" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
          {questions.map((q) => (
            <div key={q.key}>
              <div style={{ fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 6 }}>{q.q}</div>
              <textarea
                value={answers[q.key]}
                onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}
                rows={2}
                style={{ width: "100%", borderRadius: T.rSm, border: `1px solid ${T.hairline}`, padding: 12, fontFamily: T.font, fontSize: 14, color: T.ink, boxSizing: "border-box", resize: "none", outline: "none" }}
                onFocus={(e) => (e.target.style.border = `2px solid ${T.ink}`)}
                onBlur={(e) => (e.target.style.border = `1px solid ${T.hairline}`)}
              />
            </div>
          ))}
          {quotaMessage && (
            <div style={{ fontFamily: T.font, fontSize: 12, color: "#b0463a", backgroundColor: "#fbeceb", borderRadius: T.rSm, padding: "8px 12px" }}>{quotaMessage}</div>
          )}
          <Btn full disabled={!allFilled} onClick={submit}>Get Zoe's synthesis</Btn>
        </div>
      )}
      {stage === "loading" && <div style={{ padding: "24px 0" }}><LoadingDots text="Zoe is reflecting with you" /></div>}
      {stage === "result" && result && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 14 }}>
          <Card padding={18}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <ZoeAvatar size={22} mood="celebrate" />
              <span style={{ fontFamily: T.font, fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase" }}>Zoe's synthesis</span>
            </div>
            <p style={{ fontFamily: T.font, fontSize: 14, color: T.ink, lineHeight: 1.5, margin: "0 0 10px" }}>{result.summary}</p>
            <p style={{ fontFamily: T.font, fontSize: 14, color: T.body, lineHeight: 1.5, margin: "0 0 10px" }}><b>Insight:</b> {result.insight}</p>
            <div style={{ fontFamily: T.font, fontSize: 12, fontWeight: 700, color: T.mutedSoft, textTransform: "uppercase", marginBottom: 6 }}>Suggested adjustments</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {result.suggestedAdjustments.map((a, i) => <li key={i} style={{ fontFamily: T.font, fontSize: 13, color: T.body, marginBottom: 4 }}>{a}</li>)}
            </ul>
            <p style={{ fontFamily: T.font, fontSize: 13, color: T.muted, fontStyle: "italic", marginTop: 12 }}>&quot;{result.encouragement}&quot; — Zoe</p>
          </Card>
          <Btn full icon={RefreshCw} onClick={() => onComplete(result)}>Start next sprint</Btn>
        </div>
      )}
    </div>
  );
}
