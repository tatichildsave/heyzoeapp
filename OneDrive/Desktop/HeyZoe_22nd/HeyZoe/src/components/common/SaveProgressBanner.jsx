import React from "react";
import { Lock, X } from "lucide-react";
import { T } from "../../theme";

/**
 * Proactive prompt to encourage anonymous users to create a real account
 * after their first goal is created. Mounted once at the app-shell level
 * (alongside ReminderBanner in App.jsx), positioned to take turns rather
 * than overlap.
 *
 * Dismissible with a cooldown: once dismissed, doesn't show again for
 * 7 days, allowing users to proceed without nagging while still giving
 * them the opportunity to sign up when they're ready.
 */
export function SaveProgressBanner({ hasRealAccount, onSignup, onDismiss }) {
  if (hasRealAccount) return null;

  return (
    <div style={{ position: "absolute", top: 14, left: 14, right: 14, zIndex: 25, animation: "fadeUp .3s ease" }}>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
          backgroundColor: T.canvas, borderRadius: T.rMd, padding: "12px 12px 12px 14px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.14)", border: `1px solid ${T.hairlineSoft}`,
        }}
      >
        <div style={{
          width: 6, height: 34, borderRadius: T.rFull, flexShrink: 0,
          backgroundColor: T.primary,
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 700, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Save your progress
          </div>
          <div style={{ fontFamily: T.font, fontSize: 11, color: T.muted, marginTop: 1 }}>Create a free account</div>
        </div>
        <Lock size={14} color={T.primary} style={{ flexShrink: 0 }} />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSignup();
          }}
          style={{
            fontFamily: T.font, fontSize: 11, fontWeight: 600, color: T.primary,
            backgroundColor: "transparent", border: "none", cursor: "pointer",
            padding: "4px 8px", flexShrink: 0, whiteSpace: "nowrap",
          }}
        >
          Sign up
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          aria-label="Dismiss for 7 days"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0, display: "flex" }}
        >
          <X size={15} color={T.mutedSoft} />
        </button>
      </div>
    </div>
  );
}
