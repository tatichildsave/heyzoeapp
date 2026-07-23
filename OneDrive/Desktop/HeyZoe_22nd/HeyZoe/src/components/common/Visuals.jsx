import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { T } from "../../theme";
import { catById, catColor } from "../../constants";

export function Pill({ label, selected, onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: T.font,
        fontSize: 14,
        fontWeight: 500,
        borderRadius: T.rFull,
        padding: "10px 18px",
        border: `1px solid ${selected ? T.ink : T.hairline}`,
        backgroundColor: selected ? T.ink : T.canvas,
        color: selected ? T.onPrimary : T.ink,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {Icon && <Icon size={15} />}
      {label}
    </button>
  );
}

export function ProgressRing({ value, size = 96, stroke = 9, label, sub, color }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={T.hairlineSoft} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color || T.primary}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: T.font, fontSize: 24, fontWeight: 700, color: T.ink, lineHeight: 1 }}>{label}</div>
        {sub && <div style={{ fontFamily: T.font, fontSize: 10, color: T.muted, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

export function CategoryIcon({ id, size = 20, color = T.ink }) {
  const c = catById(id);
  if (!c) return null;
  const Icon = c.icon;
  return <Icon size={size} color={color} />;
}

export function CatBadge({ id, size = 38, iconSize }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: T.rFull,
        backgroundColor: catColor(id) || T.surfaceStrong,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <CategoryIcon id={id} size={iconSize || Math.round(size * 0.45)} color={T.ink} />
    </div>
  );
}

export function LoadingDots({ text = "Zoe is thinking" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.muted, fontFamily: T.font, fontSize: 13 }}>
      <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
      {text}...
    </div>
  );
}

// Mood -> asset. "celebrate" reuses the happy portrait at avatar sizes;
// the full-body hero pose (mascot/hero.png) is used separately at larger
// display sizes (see onboarding Welcome screen) for more impact.
const MASCOT_SRC = {
  idle: "/mascot/happy.png",
  celebrate: "/mascot/happy.png",
  thinking: "/mascot/thinking.png",
  waving: "/mascot/waving.png",
};

export function ZoeAvatar({ size = 36, mood = "idle", glow = false }) {
  const src = MASCOT_SRC[mood] || MASCOT_SRC.idle;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      {glow && (
        <div
          style={{
            position: "absolute",
            inset: -6,
            borderRadius: T.rFull,
            background: `radial-gradient(circle, ${T.goldSoft} 0%, rgba(242,223,192,0) 70%)`,
          }}
        />
      )}
      <img
        src={src}
        alt=""
        style={{ position: "relative", width: "100%", height: "100%", objectFit: "contain", objectPosition: "bottom" }}
      />
    </div>
  );
}

export function ConfettiBurst({ show, count = 26 }) {
  if (!show) return null;
  const pieces = Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: `${4 + ((i * 91) % 92)}%`,
    delay: `${(i % 8) * 0.05}s`,
    duration: `${1.2 + (i % 5) * 0.15}s`,
    color: [T.gold, "#3a74d8", T.sage, "#f4c95d", "#d47ab3"][i % 5],
  }));
  return (
    <div style={{ pointerEvents: "none", position: "absolute", inset: 0, overflow: "hidden", zIndex: 30 }}>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: p.left,
            top: -12,
            width: 8,
            height: 12,
            borderRadius: 2,
            backgroundColor: p.color,
            animation: `confettiFall ${p.duration} ease-out ${p.delay} forwards`,
            transform: `rotate(${(p.id * 31) % 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export function useViewport(ref) {
  const [width, setWidth] = useState(430);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  const device = width < 744 ? "mobile" : width < 1128 ? "tablet" : "desktop";
  return { width, device };
}
