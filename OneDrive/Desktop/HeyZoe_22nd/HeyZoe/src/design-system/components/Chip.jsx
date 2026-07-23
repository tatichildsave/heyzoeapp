import React from "react";
import { colors } from "../tokens/colors";
import { radius } from "../tokens/radius";
import { spacing } from "../tokens/spacing";
import { typography } from "../tokens/typography";

export function Chip({ label, selected = false, onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        borderRadius: radius.pill,
        border: selected ? "none" : `1px solid ${colors.border.subtle}`,
        backgroundColor: selected ? colors.brand.primary : colors.bg.surface,
        color: selected ? colors.text.inverse : colors.text.body,
        fontFamily: typography.family,
        fontSize: typography.size.sm,
        fontWeight: typography.weight.medium,
        display: "inline-flex",
        alignItems: "center",
        gap: spacing[2],
        height: 34,
        padding: `0 ${spacing[3]}px`,
        cursor: "pointer",
      }}
    >
      {Icon && <Icon size={14} />}
      {label}
    </button>
  );
}
