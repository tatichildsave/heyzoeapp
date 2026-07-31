import React, { useState } from "react";
import { Award, RefreshCw, Star } from "lucide-react";
import { T } from "../../theme";
import { Btn, Card, ScreenHeader } from "../common/Primitives";
import { LoadingDots } from "../common/Visuals";
import { zoeLifeReport, QuotaError } from "../../services/ai";
import { trackEvent } from "../../services/analytics";

/**
 * Reached from You > More > Life Report. The report itself is generated
 * on demand (it's a synthesis of current data, not something to keep
 * regenerating automatically) but — unlike the original monolith, where
 * it lived in local component state and vanished the moment you navigated
 * away — the last report is persisted (see useAppState: `report`), so
 * leaving and coming back doesn't lose it.
 */
export function LifeReportScreen({ state, report, onGenerated, onBack }) {
  const { goals, sprintsCompleted, xp } = state;
  const [loading, setLoading] = useState(false);
  const [quotaMessage, setQuotaMessage] = useState(null);

  const generate = async () => {
    setLoading(true);
    setQuotaMessage(null);
    const summary = goals.length
      ? goals.map((g) => `${g.title}: ${g.milestones.filter((m) => m.done).length}/${g.milestones.length} milestones complete`).join("; ")
      : "No goals set yet";
    try {
      const r = await zoeLifeReport(summary, sprintsCompleted, xp);
      trackEvent("life_report_generated", { goals_count: goals.length });
      onGenerated(r);
    } catch (e) {
      if (e instanceof QuotaError) {
        setQuotaMessage(e.message);
      } else {
        throw e;
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px 20px 100px", overflowY: "auto", height: "100%" }}>
      <ScreenHeader title="Life Report" subtitle="Your achievements, growth, and lessons — synthesized by Zoe." onBack={onBack} />

      {!report && !loading && (
        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center", padding: "0 12px" }}>
          <Award size={36} color={T.mutedSoft} />
          <div style={{ fontFamily: T.font, fontSize: 14, color: T.body }}>Generate a report of your journey so far — Zoe will pull it together from your goals and sprints.</div>
          <Btn onClick={generate} disabled={goals.length === 0}>Generate my Life Report</Btn>
          {goals.length === 0 && <div style={{ fontFamily: T.font, fontSize: 12, color: T.mutedSoft }}>Add a goal first — there's nothing to report on yet.</div>}
          {quotaMessage && (
            <div style={{ fontFamily: T.font, fontSize: 12, color: "#b0463a", backgroundColor: "#fbeceb", borderRadius: T.rSm, padding: "8px 12px", marginTop: 4 }}>{quotaMessage}</div>
          )}
        </div>
      )}

      {loading && <div style={{ padding: "30px 0", display: "flex", justifyContent: "center" }}><LoadingDots text="Zoe is writing your report" /></div>}

      {report && !loading && (
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
          <Card padding={20} style={{ backgroundColor: T.ink, border: "none" }}>
            <div style={{ fontFamily: T.font, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", marginBottom: 6, letterSpacing: 0.4 }}>Hey Zoe · Life Report</div>
            <div style={{ fontFamily: T.font, fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{report.headline}</div>
          </Card>

          <Card padding={18}>
            <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 700, color: T.mutedSoft, textTransform: "uppercase", marginBottom: 10, letterSpacing: 0.4 }}>Achievements</div>
            {report.achievements.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <Star size={14} color={T.gold} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontFamily: T.font, fontSize: 14, color: T.ink }}>{a}</span>
              </div>
            ))}
          </Card>

          <Card padding={18}>
            <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 700, color: T.mutedSoft, textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.4 }}>Growth</div>
            <p style={{ fontFamily: T.font, fontSize: 14, color: T.body, lineHeight: 1.5, margin: 0 }}>{report.growthNarrative}</p>
          </Card>

          <Card padding={18}>
            <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 700, color: T.mutedSoft, textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.4 }}>Lessons learned</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {report.lessons.map((l, i) => <li key={i} style={{ fontFamily: T.font, fontSize: 14, color: T.body, marginBottom: 4 }}>{l}</li>)}
            </ul>
          </Card>

          <Card padding={18}>
            <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 700, color: T.mutedSoft, textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.4 }}>Next steps</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {report.nextSteps.map((l, i) => <li key={i} style={{ fontFamily: T.font, fontSize: 14, color: T.body, marginBottom: 4 }}>{l}</li>)}
            </ul>
          </Card>

          <Btn full variant="secondary" icon={RefreshCw} onClick={generate}>Regenerate</Btn>
        </div>
      )}
    </div>
  );
}
