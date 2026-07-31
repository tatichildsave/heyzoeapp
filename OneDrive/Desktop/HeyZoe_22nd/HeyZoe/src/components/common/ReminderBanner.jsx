import React from "react";
import { ChevronRight, X } from "lucide-react";
import { T } from "../../theme";
import { describeUrgentMilestone } from "../../utils/milestones";

/**
 * Mounted once at the app-shell level (alongside Celebration in App.jsx),
 * not inside Home — so it's visible whichever of the 3 tabs you're on,
 * and reflects the exact same urgency data Home's "Today" card shows
 * (same describeUrgentMilestone() call, no separate copy).
 *
 * Visibility is decided entirely by the caller (shouldShowReminder() in
 * utils/milestones.js) — this component just renders whatever urgent
 * milestone it's handed.
 */
export function ReminderBanner({ urgent, onOpen, onDismiss }) {
  if (!urgent) return null;
  const { primary, secondary, urgency } = describeUrgentMilestone(urgent);
  const isOverdue = urgency === "overdue";

  return (
    <div style={{ position: "absolute", top: 14, left: 14, right: 14, zIndex: 25, animation: "fadeUp .3s ease" }}>
      <div
        onClick={onOpen}
        style={{
          display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
          backgroundColor: T.canvas, borderRadius: T.rMd, padding: "12px 12px 12px 14px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.14)", border: `1px solid ${isOverdue ? "#b0463a" : T.hairlineSoft}`,
        }}
      >
        <div style={{
          width: 6, height: 34, borderRadius: T.rFull, flexShrink: 0,
          backgroundColor: isOverdue ? "#b0463a" : T.gold,
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 700, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{primary}</div>
          {secondary && <div style={{ fontFamily: T.font, fontSize: 11, color: isOverdue ? "#b0463a" : T.muted, marginTop: 1 }}>{secondary}</div>}
        </div>
        <ChevronRight size={16} color={T.mutedSoft} style={{ flexShrink: 0 }} />
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          aria-label="Dismiss for today"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0, display: "flex" }}
        >
          <X size={15} color={T.mutedSoft} />
        </button>
      </div>
    </div>
  );
}
