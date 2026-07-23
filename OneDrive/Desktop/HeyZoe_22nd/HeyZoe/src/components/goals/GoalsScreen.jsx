import React, { useState } from "react";
import { CheckCircle2, ChevronRight, Circle, Plus } from "lucide-react";
import { T } from "../../theme";
import { CATEGORIES, catColor } from "../../constants";
import { Card, ScreenHeader } from "../common/Primitives";
import { CatBadge, ZoeAvatar } from "../common/Visuals";

// Pops on completion via a short-lived local flag — mirrors the same
// treatment used for sprint milestones on Home, so ticking a box feels
// the same everywhere in the app.
function MilestoneRow({ m, onToggle }) {
  const [justToggled, setJustToggled] = useState(false);
  const handleClick = () => {
    if (!m.done) setJustToggled(true);
    onToggle();
  };
  return (
    <div onClick={handleClick} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
      <span
        style={{ display: "inline-flex", animation: justToggled ? "popScale .35s ease" : "none" }}
        onAnimationEnd={() => setJustToggled(false)}
      >
        {m.done ? <CheckCircle2 size={16} color={T.sage} /> : <Circle size={16} color={T.mutedSoft} />}
      </span>
      <span style={{ fontFamily: T.font, fontSize: 13, color: m.done ? T.mutedSoft : T.ink, textDecoration: m.done ? "line-through" : "none", flex: 1, transition: "color .3s ease" }}>{m.title}</span>
      <span style={{ fontFamily: T.font, fontSize: 11, color: T.mutedSoft }}>Wk {m.weekDue}</span>
    </div>
  );
}

export function GoalsScreen({ goals, openGoalBuilder, toggleMilestone, onOpenGoal }) {
  const usedCats = new Set(goals.map((g) => g.categoryId));
  const remainingCats = CATEGORIES.filter((c) => !usedCats.has(c.id));

  return (
    <div style={{ padding: "20px 20px 100px", overflowY: "auto", height: "100%" }}>
      <ScreenHeader title="Goals" subtitle={`${goals.length} active`} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
        {goals.map((g) => {
          const doneM = g.milestones.filter((m) => m.done).length;
          const pct = g.milestones.length ? Math.round((doneM / g.milestones.length) * 100) : 0;
          const accent = catColor(g.categoryId) || T.hairlineSoft;
          return (
            <Card key={g.id} padding={16} style={{ borderLeft: `4px solid ${accent}` }}>
              <div onClick={() => onOpenGoal(g.id)} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, cursor: "pointer" }}>
                <CatBadge id={g.categoryId} size={34} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: T.font, fontSize: 15, fontWeight: 600, color: T.ink }}>{g.title}</div>
                  <div style={{ fontFamily: T.font, fontSize: 12, color: T.mutedSoft }}>{doneM}/{g.milestones.length} milestones · {g.timeline}</div>
                </div>
                <span style={{ fontFamily: T.font, fontSize: 12, fontWeight: 700, color: T.ink, backgroundColor: T.surfaceSoft, borderRadius: T.rFull, padding: "4px 10px", transition: "background-color .3s ease" }}>{pct}%</span>
                <ChevronRight size={16} color={T.mutedSoft} />
              </div>
              <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted, margin: "8px 0 12px" }}>{g.specific}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {g.milestones.map((m) => (
                  <MilestoneRow key={m.id} m={m} onToggle={() => toggleMilestone(g.id, m.id)} />
                ))}
              </div>
            </Card>
          );
        })}
        {goals.length === 0 && (
          <Card padding={24} style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center" }}><ZoeAvatar size={40} mood="waving" /></div>
            <div style={{ fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.ink, marginTop: 12 }}>No goals yet</div>
            <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted, marginTop: 4 }}>Pick an area below and Zoe will draft your first one.</div>
          </Card>
        )}
      </div>
      {remainingCats.length > 0 && (
        <div style={{ marginTop: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Plus size={15} color={T.ink} />
            <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 600, color: T.ink }}>Add a goal</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {remainingCats.map((c) => (
              <Card
                key={c.id}
                onClick={() => openGoalBuilder(c.id)}
                padding={14}
                style={{ display: "flex", alignItems: "center", gap: 10, backgroundColor: catColor(c.id), border: "none" }}
              >
                <c.icon size={17} color={T.ink} />
                <span style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: T.ink }}>{c.label}</span>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
