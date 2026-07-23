import React from "react";
import { colors } from "../tokens/colors";
import { radius } from "../tokens/radius";
import { spacing } from "../tokens/spacing";
import { typography } from "../tokens/typography";

const toneMap = {
  neutral: { bg: colors.bg.soft, fg: colors.text.body },
  info: { bg: "#eaf2ff", fg: colors.state.info },
  success: { bg: "#e7f8ef", fg: colors.state.success },
  warning: { bg: "#fff3e8", fg: colors.state.warning },
  danger: { bg: "#fdeceb", fg: colors.state.danger },
};

export function Badge({ children, tone = "neutral", style }) {
  const toneConfig = toneMap[tone] || toneMap.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: radius.pill,
        padding: `${spacing[1]}px ${spacing[2]}px`,
        fontFamily: typography.family,
        fontSize: typography.size.xs,
        fontWeight: typography.weight.medium,
        lineHeight: typography.lineHeight.tight,
        backgroundColor: toneConfig.bg,
        color: toneConfig.fg,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
