import React from "react";
import { colors } from "../tokens/colors";
import { radius } from "../tokens/radius";
import { shadows } from "../tokens/shadows";
import { spacing } from "../tokens/spacing";

export function Card({ children, padding = spacing[4], elevated = false, interactive = false, onClick, style }) {
  return (
    <section
      onClick={onClick}
      style={{
        backgroundColor: colors.bg.surface,
        borderRadius: radius.md,
        border: `1px solid ${colors.border.soft}`,
        boxShadow: elevated ? shadows.sm : shadows.none,
        padding,
        cursor: interactive ? "pointer" : "default",
        transition: "box-shadow .2s ease, transform .2s ease",
        ...style,
      }}
    >
      {children}
    </section>
  );
}
