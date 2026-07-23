import React from "react";
import { Home, BarChart3, User } from "lucide-react";
import { T } from "../../theme";
import { ZoeAvatar } from "./Visuals";

// Collapsed from 5 tabs (Home, Sprint, Goals, Experts, Profile) to 3.
// Sprint check-ins now live inside Home; Experts/Couple/Report moved
// behind "You" as optional, opt-in features instead of top-level nav.
const NAV_TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "goals", label: "Goals", icon: BarChart3 },
  { id: "you", label: "You", icon: User },
];

export function BottomNav({ tab, setTab }) {
  return (
    <nav aria-label="Primary" style={{ position: "absolute", left: 0, right: 0, bottom: 14, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 4, backgroundColor: T.canvas,
        borderRadius: T.rFull, padding: 6, boxShadow: T.shadow, pointerEvents: "auto",
      }} role="tablist" aria-label="Main sections">
        {NAV_TABS.map((t) => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} aria-label={t.label} aria-selected={active} role="tab" style={{
              background: active ? T.ink : "transparent", border: "none", cursor: "pointer",
              width: 46, height: 46, borderRadius: T.rFull, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background-color .15s ease",
            }}>
              <Icon size={19} color={active ? "#fff" : T.mutedSoft} strokeWidth={active ? 2.3 : 2} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function Sidebar({ tab, setTab }) {
  return (
    <nav aria-label="Sidebar" style={{ width: 216, flexShrink: 0, borderRight: `1px solid ${T.hairline}`, padding: "24px 14px", display: "flex", flexDirection: "column", gap: 2 }}>
      <button onClick={() => setTab("home")} aria-label="Go to home" style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 8px", marginBottom: 22, border: "none", background: "none", cursor: "pointer" }}>
        <ZoeAvatar size={30} mood="idle" />
        <span style={{ fontFamily: T.font, fontSize: 16, fontWeight: 700, color: T.ink }}>Hey Zoe</span>
      </button>
      {NAV_TABS.map((t) => {
        const active = tab === t.id;
        const Icon = t.icon;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} aria-current={active ? "page" : undefined} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: T.rSm,
            border: "none", cursor: "pointer", backgroundColor: active ? T.surfaceStrong : "transparent",
            textAlign: "left", width: "100%",
          }}>
            <Icon size={17} color={T.ink} strokeWidth={active ? 2.3 : 2} />
            <span style={{ fontFamily: T.font, fontSize: 14, fontWeight: active ? 600 : 500, color: T.ink }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function AppFrame({ children, device, frameRef }) {
  const isDesktop = device === "desktop";
  const maxWidth = isDesktop ? 1180 : device === "tablet" ? 760 : 430;
  return (
    <div ref={frameRef} style={{
      width: "100%", minHeight: "100vh", backgroundColor: T.canvasOuter,
      display: "flex", justifyContent: "center", alignItems: "flex-start",
      fontFamily: T.font, boxSizing: "border-box", padding: isDesktop ? "28px 16px" : 0,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes popScale { 0% { transform: scale(1); } 40% { transform: scale(1.35); } 100% { transform: scale(1); } }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(201,138,62,0.35); } 70% { box-shadow: 0 0 0 14px rgba(201,138,62,0); } 100% { box-shadow: 0 0 0 0 rgba(201,138,62,0); } }
        @keyframes floatUpFade { 0% { opacity: 0; transform: translateY(4px); } 20% { opacity: 1; transform: translateY(-2px); } 80% { opacity: 1; transform: translateY(-14px); } 100% { opacity: 0; transform: translateY(-22px); } }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(106vh) rotate(540deg); opacity: 0; }
        }
        @keyframes modalPop { 0% { opacity: 0; transform: scale(0.92) translateY(6px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        ::-webkit-scrollbar { width: 0px; height: 0px; }
      `}</style>
      <div style={{
        width: "100%", maxWidth, height: isDesktop ? "calc(100vh - 56px)" : "100vh",
        minHeight: isDesktop ? 600 : 700,
        backgroundColor: T.canvas, position: "relative", overflow: "hidden",
        borderRadius: isDesktop ? 20 : 0,
        boxShadow: isDesktop ? "0 8px 40px rgba(0,0,0,0.12)" : "0 0 40px rgba(0,0,0,0.06)",
      }}>
        {children}
      </div>
    </div>
  );
}
