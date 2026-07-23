import React from "react";
import { Compass } from "lucide-react";
import { Btn, Card } from "../common/Primitives";
import { T } from "../../theme";

export function CommandCenter({ commandBrief, sprint, goToSprint, openGoalBuilder, remainingCats, openExperts }) {
  return (
    <Card padding={16} style={{ marginTop: 14, borderColor: T.borderStrong }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: T.rFull, backgroundColor: T.surfaceStrong, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Compass size={16} color={T.ink} />
          </div>
          <div>
            <div style={{ fontFamily: T.font, fontSize: 14, fontWeight: 700, color: T.ink }}>AI Command Center</div>
            <div style={{ fontFamily: T.font, fontSize: 11, color: T.muted }}>Momentum: {commandBrief.momentum} · {commandBrief.completionText}</div>
          </div>
        </div>
        <div style={{ fontFamily: T.font, fontSize: 12, color: T.mutedSoft }}>Streak {commandBrief.streak}</div>
      </div>

      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontFamily: T.font, fontSize: 13, color: T.ink }}>
          <strong>Now:</strong> {commandBrief.primaryNudge}
        </div>
        <div style={{ fontFamily: T.font, fontSize: 13, color: T.body }}>
          <strong>Next:</strong> {commandBrief.secondaryNudge}
        </div>
        {commandBrief.topGoal && (
          <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted }}>
            Top trajectory: {commandBrief.topGoal.title} ({commandBrief.topGoal.pct}%)
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Btn size="sm" onClick={sprint ? goToSprint : () => openGoalBuilder(remainingCats[0]?.id || "finances")}>{sprint ? "Open sprint" : "Start focus"}</Btn>
        <Btn size="sm" variant="secondary" onClick={() => openExperts && openExperts("all")}>Find expert</Btn>
      </div>
    </Card>
  );
}
