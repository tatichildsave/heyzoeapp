import React, { useEffect } from "react";
import { Snowflake } from "lucide-react";
import { T } from "../../theme";
import { ConfettiBurst, ZoeAvatar } from "./Visuals";

const DURATIONS = { levelup: 2600, "goal-complete": 2800, badge: 2200, "freeze-used": 2400, "freeze-earned": 2200 };
const MODAL_TYPES = ["levelup", "goal-complete"];

function toastContent(celebration) {
  if (celebration.type === "badge") {
    return {
      icon: celebration.badge?.icon,
      iconBg: `linear-gradient(135deg, ${T.gold}, #b9791f)`,
      title: "Badge earned",
      subtitle: celebration.badge?.label,
    };
  }
  if (celebration.type === "freeze-used") {
    return {
      icon: Snowflake,
      iconBg: "linear-gradient(135deg, #6fa8c9, #3d7599)",
      title: "Streak saved with a freeze",
      subtitle: `${celebration.freezesLeft} freeze${celebration.freezesLeft === 1 ? "" : "s"} left`,
    };
  }
  if (celebration.type === "freeze-earned") {
    return {
      icon: Snowflake,
      iconBg: "linear-gradient(135deg, #6fa8c9, #3d7599)",
      title: "Streak freeze earned",
      subtitle: `${celebration.freezesLeft} available now`,
    };
  }
  return null;
}

/**
 * Reserved for moments that matter across the whole app: leveling up,
 * earning a badge, or a streak freeze being used/earned. Routine actions
 * (a daily check-in, ticking a milestone) get small local animations
 * instead — see Home.jsx / GoalsScreen.jsx — so the big confetti moment
 * stays special instead of firing constantly.
 */
export function Celebration({ celebration, onDone }) {
  useEffect(() => {
    if (!celebration) return;
    const t = setTimeout(onDone, DURATIONS[celebration.type] || 2200);
    return () => clearTimeout(t);
  }, [celebration, onDone]);

  if (!celebration) return null;

  const isModal = MODAL_TYPES.includes(celebration.type);
  const toast = !isModal ? toastContent(celebration) : null;
  const Icon = toast?.icon;

  return (
    <div
      onClick={onDone}
      style={{
        position: "absolute", inset: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: isModal ? "rgba(34,34,34,0.28)" : "transparent",
        cursor: "pointer",
      }}
    >
      <ConfettiBurst show count={isModal ? 32 : 20} />
      {celebration.type === "levelup" ? (
        <div style={{
          animation: "modalPop .35s cubic-bezier(.2,.8,.3,1.2)",
          backgroundColor: T.canvas, borderRadius: T.rLg, padding: "28px 32px", textAlign: "center",
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        }}>
          <ZoeAvatar size={56} mood="celebrate" glow />
          <div style={{ fontFamily: T.font, fontSize: 20, fontWeight: 700, color: T.ink, marginTop: 6 }}>Level {celebration.level}!</div>
          <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted }}>Zoe's proud of you. Keep it going.</div>
        </div>
      ) : celebration.type === "goal-complete" ? (
        <div style={{
          animation: "modalPop .35s cubic-bezier(.2,.8,.3,1.2)",
          backgroundColor: T.canvas, borderRadius: T.rLg, padding: "28px 32px", textAlign: "center", maxWidth: 280,
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        }}>
          <ZoeAvatar size={56} mood="celebrate" glow />
          <div style={{ fontFamily: T.font, fontSize: 20, fontWeight: 700, color: T.ink, marginTop: 6 }}>Goal complete!</div>
          <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted }}>"{celebration.goalTitle}" — every milestone done. Well earned.</div>
        </div>
      ) : toast ? (
        <div style={{
          position: "absolute", top: 18, left: 20, right: 20,
          animation: "fadeUp .3s ease",
          backgroundColor: T.canvas, borderRadius: T.rMd, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 6px 20px rgba(0,0,0,0.14)", border: `1px solid ${T.hairlineSoft}`,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: T.rFull, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
            background: toast.iconBg,
          }}>
            {Icon && <Icon size={16} color="#fff" />}
          </div>
          <div>
            <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 700, color: T.ink }}>{toast.title}</div>
            <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted }}>{toast.subtitle}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
