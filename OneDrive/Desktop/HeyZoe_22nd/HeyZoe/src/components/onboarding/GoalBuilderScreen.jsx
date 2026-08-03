import React, { useState } from "react";
import { Circle, Send, UserPlus, Zap, Check } from "lucide-react";
import { T } from "../../theme";
import { catById } from "../../constants";
import { Btn, Card, ScreenHeader } from "../common/Primitives";
import { CatBadge, LoadingDots, Pill, ZoeAvatar } from "../common/Visuals";
import { zoeGenerateGoal, zoeGenerateClarifyingQuestions, QuotaError } from "../../services/ai";

const DURATION_PRESETS = [
  { months: 1, label: "1 month" },
  { months: 3, label: "3 months" },
  { months: 6, label: "6 months" },
  { months: 12, label: "1 year" },
  { months: 24, label: "2 years" },
];

// Onboarding's first goal skips this (see SimpleOnboarding — one less
// decision before a first-time user's first win); it only shows up once
// someone's adding a second goal from the Goals tab, where a bit more
// setup is earned rather than friction.
export function GoalBuilderScreen({ categoryId, horizon, onDone, onBack, mode, shared, setShared, onFindExpert, showDurationPicker = true }) {
  const cat = catById(categoryId);
  const [aspiration, setAspiration] = useState("");
  const [horizonMonths, setHorizonMonths] = useState(horizon);
  const [stage, setStage] = useState("input");
  const [goal, setGoal] = useState(null);
  const [clarifyingQuestions, setClarifyingQuestions] = useState([]);
  const [clarifyingAnswers, setClarifyingAnswers] = useState({});
  const [quotaMessage, setQuotaMessage] = useState(null);

  const handleGenerate = async () => {
    if (!aspiration.trim()) return;
    setStage("loading-questions");
    setQuotaMessage(null);
    try {
      const questionsResult = await zoeGenerateClarifyingQuestions(
        cat.label,
        aspiration.trim(),
        horizonMonths
      );
      setClarifyingQuestions(questionsResult.questions || []);
      setClarifyingAnswers({});
      setStage("questions");
    } catch (e) {
      // If clarifying questions fail (quota hit or network error),
      // skip the questions stage and go straight to goal generation.
      // Don't block goal creation on a failed clarifying-questions call.
      if (e instanceof QuotaError) {
        setQuotaMessage(e.message);
        setStage("input");
      } else {
        // Network or shape error: silently skip to loading with empty answers
        handleGenerateGoal([]);
      }
    }
  };

  const handleGenerateGoal = async (answers) => {
    setStage("loading");
    setQuotaMessage(null);
    try {
      const result = await zoeGenerateGoal(
        cat.label,
        aspiration.trim(),
        horizonMonths,
        answers
      );
      setGoal(result);
      setStage("result");
    } catch (e) {
      if (e instanceof QuotaError) {
        setQuotaMessage(e.message);
        setStage("questions");
      } else {
        throw e;
      }
    }
  };

  const handleSkipQuestions = () => {
    handleGenerateGoal([]);
  };

  const handleContinueWithAnswers = () => {
    const answers = clarifyingQuestions.map((q) => ({
      question: q,
      answer: clarifyingAnswers[q] || "",
    }));
    handleGenerateGoal(answers);
  };

  return (
    <div style={{ padding: "0 20px", height: "100%", display: "flex", flexDirection: "column", overflowY: "auto" }}>
    <ScreenHeader
      title={`${cat.label} goal`}
      subtitle={
        stage === "result"
          ? "Zoe turned this into a SMART goal"
          : stage === "questions"
          ? "Help Zoe understand your goal better"
          : "Tell Zoe your aspiration, in your own words"
      }
      onBack={stage === "questions" ? () => setStage("input") : onBack}
    />

      {stage !== "result" && (
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        {stage === "input" && (
          <>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <ZoeAvatar size={32} mood="idle" />
            <div style={{ backgroundColor: T.surfaceSoft, borderRadius: "4px 14px 14px 14px", padding: "12px 14px", fontFamily: T.font, fontSize: 14, color: T.ink, lineHeight: 1.5 }}>
              What's your {cat.label.toLowerCase()} aspiration for the next {horizonMonths} month{horizonMonths === 1 ? "" : "s"}? Don't worry about making it perfect — I'll help shape it.
            </div>
          </div>

          {showDurationPicker && (
            <div>
              <div style={{ fontFamily: T.font, fontSize: 12, fontWeight: 700, color: T.mutedSoft, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 8 }}>Timeframe</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {DURATION_PRESETS.map((p) => (
                  <Pill key={p.months} label={p.label} selected={horizonMonths === p.months} onClick={() => setHorizonMonths(p.months)} />
                ))}
              </div>
            </div>
          )}

          <textarea
            value={aspiration}
            onChange={(e) => setAspiration(e.target.value)}
            placeholder='e.g. "I want to feel financially secure and build real savings"'
            rows={4}
            style={{ width: "100%", borderRadius: T.rSm, border: `1px solid ${T.hairline}`, padding: 14, fontFamily: T.font, fontSize: 15, color: T.ink, boxSizing: "border-box", resize: "none", outline: "none" }}
            onFocus={(e) => (e.target.style.border = `2px solid ${T.ink}`)}
            onBlur={(e) => (e.target.style.border = `1px solid ${T.hairline}`)}
          />

          {mode === "couple" && (
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: T.font, fontSize: 13, color: T.body, cursor: "pointer" }}>
              <input type="checkbox" checked={shared} onChange={(e) => setShared(e.target.checked)} style={{ width: 16, height: 16 }} />
              Share this goal on our joint dashboard
            </label>
          )}

          {quotaMessage && (
            <div style={{ fontFamily: T.font, fontSize: 12, color: "#b0463a", backgroundColor: "#fbeceb", borderRadius: T.rSm, padding: "8px 12px" }}>{quotaMessage}</div>
          )}

          {stage === "loading-questions" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "24px 0" }}>
              <ZoeAvatar size={48} mood="thinking" />
              <LoadingDots text="Zoe is thinking up some questions for you" />
            </div>
          )}

          {stage === "loading" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "24px 0" }}>
              <ZoeAvatar size={48} mood="thinking" />
              <LoadingDots text="Zoe is shaping your SMART goal" />
            </div>
          )}

          {stage === "input" && (
            <Btn full icon={Send} disabled={!aspiration.trim()} onClick={handleGenerate}>Ask Zoe</Btn>
          )}
          </>
        )}

        {stage === "questions" && (
          <>
          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 14 }}>
            {clarifyingQuestions.map((q, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <ZoeAvatar size={32} mood="idle" />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ backgroundColor: T.surfaceSoft, borderRadius: "4px 14px 14px 14px", padding: "12px 14px", fontFamily: T.font, fontSize: 14, color: T.ink, lineHeight: 1.5 }}>
                    {q}
                  </div>
                  <input
                    type="text"
                    value={clarifyingAnswers[q] || ""}
                    onChange={(e) => setClarifyingAnswers({ ...clarifyingAnswers, [q]: e.target.value })}
                    placeholder="Your answer..."
                    style={{
                      borderRadius: T.rSm,
                      border: `1px solid ${T.hairline}`,
                      padding: "10px 12px",
                      fontFamily: T.font,
                      fontSize: 14,
                      color: T.ink,
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                    onFocus={(e) => (e.target.style.border = `2px solid ${T.ink}`)}
                    onBlur={(e) => (e.target.style.border = `1px solid ${T.hairline}`)}
                  />
                </div>
              </div>
            ))}
          </div>

          {quotaMessage && (
            <div style={{ fontFamily: T.font, fontSize: 12, color: "#b0463a", backgroundColor: "#fbeceb", borderRadius: T.rSm, padding: "8px 12px" }}>
              {quotaMessage}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
            <Btn full icon={Send} onClick={handleContinueWithAnswers}>
              Continue
            </Btn>
            <button
              onClick={handleSkipQuestions}
              style={{
                fontFamily: T.font,
                fontSize: 13,
                color: T.muted,
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
                padding: "8px 0",
              }}
            >
              Skip, just generate it
            </button>
          </div>
          </>
        )}
        </div>
      )}

      {stage === "result" && goal && (
        <div style={{ marginTop: 12, overflowY: "auto", paddingBottom: 90 }}>
          <Card padding={18} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CatBadge id={categoryId} size={30} iconSize={14} />
              <span style={{ fontFamily: T.font, fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4 }}>{cat.label}</span>
            </div>
            <h2 style={{ fontFamily: T.font, fontSize: 20, fontWeight: 700, color: T.ink, margin: 0 }}>{goal.title}</h2>

            <div>
              <div style={{ fontFamily: T.font, fontSize: 12, fontWeight: 700, color: T.mutedSoft, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 3 }}>Specific</div>
              <div style={{ fontFamily: T.font, fontSize: 14, color: T.body, lineHeight: 1.5 }}>{goal.specific}</div>
            </div>
            <div>
              <div style={{ fontFamily: T.font, fontSize: 12, fontWeight: 700, color: T.mutedSoft, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 3 }}>Measurable</div>
              <div style={{ fontFamily: T.font, fontSize: 14, color: T.body, lineHeight: 1.5 }}>{goal.measurable}</div>
            </div>

            <div style={{ borderTop: `1px solid ${T.hairlineSoft}`, paddingTop: 12 }}>
              <div style={{ fontFamily: T.font, fontSize: 12, fontWeight: 700, color: T.mutedSoft, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 8 }}>Milestones · {goal.timeline}</div>
              {goal.milestones.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                  <Circle size={15} color={T.mutedSoft} />
                  <div style={{ flex: 1, fontFamily: T.font, fontSize: 14, color: T.ink }}>{m.title}</div>
                  <div style={{ fontFamily: T.font, fontSize: 12, color: T.mutedSoft }}>Wk {m.weekDue}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: `1px solid ${T.hairlineSoft}`, paddingTop: 12 }}>
              <div style={{ fontFamily: T.font, fontSize: 12, fontWeight: 700, color: T.mutedSoft, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 8 }}>Suggested habits</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {goal.habits.map((h, i) => (
                  <span key={i} style={{ fontFamily: T.font, fontSize: 12, color: T.ink, backgroundColor: T.surfaceSoft, borderRadius: T.rFull, padding: "6px 12px" }}>{h}</span>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: T.surfaceSoft, borderRadius: T.rSm, padding: 12, display: "flex", gap: 8 }}>
              <Zap size={16} color={T.primary} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontFamily: T.font, fontSize: 12, fontWeight: 700, color: T.ink, marginBottom: 2 }}>First sprint focus</div>
                <div style={{ fontFamily: T.font, fontSize: 13, color: T.body, lineHeight: 1.4 }}>{goal.firstSprintFocus}</div>
              </div>
            </div>

            <p style={{ fontFamily: T.font, fontSize: 13, color: T.muted, fontStyle: "italic", margin: 0 }}>&quot;{goal.encouragement}&quot; — Zoe</p>

            <button onClick={() => onFindExpert(categoryId)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: T.goldSoft, border: "none", borderRadius: T.rSm, padding: "12px 16px", cursor: "pointer" }}>
              <UserPlus size={16} color={T.gold} />
              <span style={{ fontFamily: T.font, fontSize: 14, fontWeight: 600, color: "#7a5424" }}>Want more help? Talk to a {cat.label.toLowerCase()} expert</span>
            </button>
          </Card>

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <Btn variant="secondary" full onClick={() => setStage("input")}>Regenerate</Btn>
            <Btn full icon={Check} onClick={() => onDone({ ...goal, categoryId, shared: mode === "couple" ? shared : false, id: `${categoryId}-${Date.now()}` })}>Save goal</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
