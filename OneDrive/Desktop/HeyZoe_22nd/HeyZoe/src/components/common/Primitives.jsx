import React from "react";
import { ChevronLeft } from "lucide-react";
import { T } from "../../theme";
import { Button as DSButton, Card as DSCard, Input as DSInput, Badge as DSBadge, Chip as DSChip, Dialog as DSDialog, EmptyState as DSEmptyState, Skeleton as DSSkeleton, SkeletonText as DSSkeletonText } from "../../design-system";

export function Btn({ children, onClick, variant = "primary", disabled, full, style, icon: Icon, size = "md" }) {
  const variantMap = { tertiary: "ghost", pill: "primary" };
  const nextVariant = variantMap[variant] || variant;
  const nextSize = size === "sm" ? "sm" : "md";
  const legacyPillStyle = variant === "pill"
    ? { borderRadius: T.rFull, height: 38, padding: "0 20px", fontSize: 14 }
    : null;
  return (
    <DSButton onClick={onClick} disabled={disabled} fullWidth={full} variant={nextVariant} size={nextSize} icon={Icon} style={{ ...legacyPillStyle, ...style }}>{children}</DSButton>
  );
}

export function Card({ children, style, onClick, padding = 16 }) {
  return <DSCard onClick={onClick} interactive={!!onClick} padding={padding} style={style}>{children}</DSCard>;
}

export function ScreenHeader({ title, subtitle, onBack, right }) {
  return (
    <div style={{ padding: "20px 20px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {onBack && (
            <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, marginLeft: -6 }}>
              <ChevronLeft size={22} color={T.ink} />
            </button>
          )}
          <h1 style={{ fontFamily: T.font, fontSize: 22, fontWeight: 600, color: T.ink, letterSpacing: -0.4, margin: 0 }}>{title}</h1>
        </div>
        {right}
      </div>
      {subtitle && <p style={{ fontFamily: T.font, fontSize: 14, color: T.muted, margin: 0 }}>{subtitle}</p>}
    </div>
  );
}

export const Input = DSInput;
export const Badge = DSBadge;
export const Chip = DSChip;
export const Dialog = DSDialog;
export const EmptyState = DSEmptyState;
export const Skeleton = DSSkeleton;
export const SkeletonText = DSSkeletonText;
