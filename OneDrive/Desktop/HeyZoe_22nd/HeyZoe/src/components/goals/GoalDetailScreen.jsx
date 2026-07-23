import React, { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { T } from "../../theme";
import { catById } from "../../constants";
import { Btn, Card, ScreenHeader } from "../common/Primitives";
import { CatBadge } from "../common/Visuals";

function MilestoneRow({ m, onToggle }) {
  const [justToggled, setJustToggled] = useState(false);
  const handleClick = () => {
    if (!m.done) setJustToggled(true);
    onToggle();
  };
  return (
    <div onClick={handleClick} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
      <span style={{ display: "inline-flex", animation: justToggled ? "popScale .35s ease" : "none" }} onAnimationEnd={() => setJustToggled(false)}>
        {m.done ? <CheckCircle2 size={16} color={T.sage} /> : <Circle size={16} color={T.mutedSoft} />}
      </span>
      <span style={{ fontFamily: T.font, fontSize: 13, color: m.done ? T.mutedSoft : T.ink, textDecoration: m.done ? "line-through" : "none", flex: 1, transition: "color .3s ease" }}>{m.title}</span>
      <span style={{ fontFamily: T.font, fontSize: 11, color: T.mutedSoft }}>Wk {m.weekDue}</span>
    </div>
  );
}

function HabitRow({ h, onCheckIn }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const checkedToday = h.lastCheckIn === todayStr;
  const [justChecked, setJustChecked] = useState(false);
  const handleClick = () => {
    if (checkedToday) return;
    setJustChecked(true);
    onCheckIn();
  };
  return (
    <Card padding={14} style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ display: "inline-flex", animation: justChecked ? "popScale .35s ease" : "none" }} onAnimationEnd={() => setJustChecked(false)}>
        {checkedToday ? <CheckCircle2 size={18} color={T.sage} /> : <Circle size={18} color={T.mutedSoft} />}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: T.font, fontSize: 13, color: T.ink }}>{h.title}</div>
        {h.streak > 0 && <div style={{ fontFamily: T.font, fontSize: 11, color: T.mutedSoft, marginTop: 1 }}>{h.streak}-day streak</div>}
      </div>
      <Btn size="sm" variant={checkedToday ? "secondary" : "primary"} disabled={checkedToday} onClick={handleClick}>{checkedToday ? "Done" : "Check in"}</Btn>
    </Card>
  );
}

/**
 * Reached by tapping a goal card on either Home or Goals. This is where
 * the actual day-to-day work on a goal happens beyond the milestone list:
 * daily habits you can check off (separate streaks per habit, small XP
 * each), and a free-text progress log for jotting wins or setbacks as
 * they happen — both were previously invisible once a goal was created.
 */
export function GoalDetailScreen({ goal, onBack, toggleMilestone, checkInHabit, addNote }) {
  const [note, setNote] = useState("");
  const doneM = goal.milestones.filter((m) => m.done).length;
  const pct = goal.milestones.length ? Math.round((doneM / goal.milestones.length) * 100) : 0;

  const submitNote = () => {
    if (!note.trim()) return;
    addNote(note.trim());
    setNote("");
  };

  return (
    <div style={{ padding: "0 20px 100px", overflowY: "auto", height: "100%" }}>
      <ScreenHeader title={goal.title} onBack={onBack} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
        <CatBadge id={goal.categoryId} size={30} />
        <span style={{ fontFamily: T.font, fontSize: 12, color: T.muted }}>{catById(goal.categoryId)?.label} · {goal.timeline}</span>
        <span style={{ marginLeft: "auto", fontFamily: T.font, fontSize: 12, fontWeight: 700, color: T.ink, backgroundColor: T.surfaceSoft, borderRadius: T.rFull, padding: "4px 10px" }}>{pct}%</span>
      </div>

      <Card padding={16} style={{ marginTop: 14 }}>
        <div style={{ fontFamily: T.font, fontSize: 12, fontWeight: 700, color: T.mutedSoft, textTransform: "uppercase", marginBottom: 4 }}>Specific</div>
        <div style={{ fontFamily: T.font, fontSize: 13, color: T.body, marginBottom: goal.measurable ? 10 : 0, lineHeight: 1.5 }}>{goal.specific}</div>
        {goal.measurable && (
          <>
            <div style={{ fontFamily: T.font, fontSize: 12, fontWeight: 700, color: T.mutedSoft, textTransform: "uppercase", marginBottom: 4 }}>Measurable</div>
            <div style={{ fontFamily: T.font, fontSize: 13, color: T.body, lineHeight: 1.5 }}>{goal.measurable}</div>
          </>
        )}
      </Card>

      <div style={{ marginTop: 20 }}>
        <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 10 }}>Milestones</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {goal.milestones.map((m) => (
            <MilestoneRow key={m.id} m={m} onToggle={() => toggleMilestone(m.id)} />
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 10 }}>Daily habits</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(goal.habits || []).map((h) => (
            <HabitRow key={h.id} h={h} onCheckIn={() => checkInHabit(h.id)} />
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 10 }}>Progress log</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitNote()}
            placeholder="Jot a quick update..."
            style={{ flex: 1, borderRadius: T.rFull, border: `1px solid ${T.hairline}`, padding: "10px 16px", fontFamily: T.font, fontSize: 13, outline: "none" }}
          />
          <Btn size="sm" onClick={submitNote} disabled={!note.trim()}>Add</Btn>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(goal.logs || []).slice().reverse().map((l) => (
            <Card key={l.id} padding={12}>
              <div style={{ fontFamily: T.font, fontSize: 13, color: T.ink }}>{l.text}</div>
              <div style={{ fontFamily: T.font, fontSize: 11, color: T.mutedSoft, marginTop: 3 }}>{l.at}</div>
            </Card>
          ))}
          {(!goal.logs || goal.logs.length === 0) && (
            <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted }}>No entries yet — log a quick win or note whenever you make progress.</div>
          )}
        </div>
      </div>
    </div>
  );
}
