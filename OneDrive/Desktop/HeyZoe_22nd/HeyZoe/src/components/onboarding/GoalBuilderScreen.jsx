import React, { useState } from "react";
import { Circle, Send, UserPlus, Zap, Check } from "lucide-react";
import { T } from "../../theme";
import { catById } from "../../constants";
import { Btn, Card, ScreenHeader } from "../common/Primitives";
import { CatBadge, LoadingDots, ZoeAvatar } from "../common/Visuals";
import { zoeGenerateGoal } from "../../services/ai";

export function GoalBuilderScreen({ categoryId, horizon, onDone, onBack, mode, shared, setShared, onFindExpert }) {
  const cat = catById(categoryId);
  const [aspiration, setAspiration] = useState("");
  const [stage, setStage] = useState("input");
  const [goal, setGoal] = useState(null);

  const handleGenerate = async () => {
    if (!aspiration.trim()) return;
    setStage("loading");
    const result = await zoeGenerateGoal(cat.label, aspiration.trim(), horizon);
    setGoal(result);
    setStage("result");
  };

  return (
    <div style={{ padding: "0 20px", height: "100%", display: "flex", flexDirection: "column" }}>
      <ScreenHeader title={`${cat.label} goal`} subtitle={stage === "result" ? "Zoe turned this into a SMART goal" : "Tell Zoe your aspiration, in your own words"} onBack={onBack} />

      {stage !== "result" && (
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <ZoeAvatar size={32} mood="idle" />
            <div style={{ backgroundColor: T.surfaceSoft, borderRadius: "4px 14px 14px 14px", padding: "12px 14px", fontFamily: T.font, fontSize: 14, color: T.ink, lineHeight: 1.5 }}>
              What's your {cat.label.toLowerCase()} aspiration for the next {horizon} months? Don't worry about making it perfect — I'll help shape it.
            </div>
          </div>

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

          {stage === "loading" ? (
            <div style={{ padding: "12px 0" }}><LoadingDots text="Zoe is shaping your SMART goal" /></div>
          ) : (
            <Btn full icon={Send} disabled={!aspiration.trim()} onClick={handleGenerate}>Ask Zoe</Btn>
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
