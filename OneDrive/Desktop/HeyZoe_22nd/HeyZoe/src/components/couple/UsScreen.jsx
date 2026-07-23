import React from "react";
import { Users } from "lucide-react";
import { T } from "../../theme";
import { catColor } from "../../constants";
import { Card, ScreenHeader } from "../common/Primitives";
import { CatBadge, ZoeAvatar } from "../common/Visuals";

function GoalRow({ g }) {
  const doneM = (g.milestones || []).filter((m) => m.done).length;
  const total = (g.milestones || []).length;
  const pct = total ? Math.round((doneM / total) * 100) : 0;
  const accent = catColor(g.categoryId) || T.hairlineSoft;
  return (
    <Card padding={14} style={{ display: "flex", alignItems: "center", gap: 10, borderLeft: `4px solid ${accent}` }}>
      <CatBadge id={g.categoryId} size={30} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: T.ink }}>{g.title}</div>
        <div style={{ height: 4, backgroundColor: T.hairlineSoft, borderRadius: T.rFull, overflow: "hidden", marginTop: 5 }}>
          <div style={{ height: "100%", width: `${pct}%`, backgroundColor: accent, borderRadius: T.rFull, transition: "width .5s ease" }} />
        </div>
      </div>
      <span style={{ fontFamily: T.font, fontSize: 11, color: T.mutedSoft }}>{pct}%</span>
    </Card>
  );
}

/**
 * Reached from You > More once linked. Shared goals only — anything the
 * user didn't explicitly mark "share with partner" during goal creation
 * never shows up here (and never left their device — see useCouple.js).
 */
export function UsScreen({ goals, partnerGoals, partnerName, onBack }) {
  const mine = goals.filter((g) => g.shared);

  return (
    <div style={{ padding: "20px 20px 100px", overflowY: "auto", height: "100%" }}>
      <ScreenHeader title="Us" subtitle={`Shared planning with ${partnerName || "your partner"}`} onBack={onBack} />

      <div style={{ marginTop: 16 }}>
        <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 700, color: T.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 }}>Your shared goals</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {mine.map((g) => <GoalRow key={g.id} g={g} />)}
          {mine.length === 0 && (
            <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted }}>None yet — check "share with partner" when creating a goal.</div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 700, color: T.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 }}>{(partnerName || "Partner")}'s shared goals</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {partnerGoals.map((g) => <GoalRow key={g.id} g={g} />)}
          {partnerGoals.length === 0 && (
            <Card padding={16} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Users size={16} color={T.mutedSoft} />
              <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted }}>Nothing shared yet — {partnerName || "your partner"} hasn't marked a goal to share, or hasn't set one up.</div>
            </Card>
          )}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <Card padding={16} style={{ display: "flex", alignItems: "center", gap: 12, backgroundColor: T.goldSoft, border: "none" }}>
          <div style={{ display: "flex" }}><ZoeAvatar size={34} mood="idle" /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: "#7a5424" }}>Monthly relationship review</div>
            <div style={{ fontFamily: T.font, fontSize: 12, color: "#7a5424" }}>Coming soon — reflect together with Zoe.</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
