import React from "react";
import { Card } from "./Card";
import { colors } from "../tokens/colors";
import { spacing } from "../tokens/spacing";
import { typography } from "../tokens/typography";

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <Card
      style={{
        padding: spacing[8],
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: spacing[3],
      }}
    >
      {Icon && <Icon size={28} color={colors.text.muted} />}
      <h3
        style={{
          margin: 0,
          fontFamily: typography.family,
          fontSize: typography.size.lg,
          fontWeight: typography.weight.semibold,
          color: colors.text.strong,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: 0,
          fontFamily: typography.family,
          fontSize: typography.size.sm,
          color: colors.text.muted,
          lineHeight: typography.lineHeight.base,
          maxWidth: 420,
        }}
      >
        {description}
      </p>
      {action}
    </Card>
  );
}
