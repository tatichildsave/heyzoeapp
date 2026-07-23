import React from "react";
import { colors } from "../tokens/colors";
import { radius } from "../tokens/radius";
import { spacing } from "../tokens/spacing";

export function Skeleton({ width = "100%", height = 12, style }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius.xs,
        background: `linear-gradient(90deg, ${colors.bg.soft} 0%, ${colors.bg.subtle} 50%, ${colors.bg.soft} 100%)`,
        backgroundSize: "200% 100%",
        animation: "ds-skeleton 1.2s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div style={{ display: "grid", gap: spacing[2] }}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton key={idx} width={idx === lines - 1 ? "72%" : "100%"} height={10} />
      ))}
    </div>
  );
}
