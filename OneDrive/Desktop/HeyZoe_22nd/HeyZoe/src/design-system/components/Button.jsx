import React from "react";
import { colors } from "../tokens/colors";
import { radius } from "../tokens/radius";
import { spacing } from "../tokens/spacing";
import { typography } from "../tokens/typography";

export function Button({
  children,
  icon: Icon,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  onClick,
  onKeyDown,
  ariaLabel,
  ariaPressed,
  ariaExpanded,
  ariaControls,
  ariaDescribedBy,
  title,
  style,
  type = "button",
  tabIndex,
}) {
  const sizeMap = {
    sm: { height: 36, fontSize: typography.size.sm, px: spacing[3] },
    md: { height: 44, fontSize: typography.size.md, px: spacing[4] },
    lg: { height: 48, fontSize: typography.size.md, px: spacing[5] },
  };

  const variantMap = {
    primary: {
      backgroundColor: disabled ? colors.bg.subtle : colors.brand.primary,
      color: disabled ? colors.text.disabled : colors.text.inverse,
      border: "none",
    },
    secondary: {
      backgroundColor: colors.bg.surface,
      color: colors.text.strong,
      border: `1px solid ${colors.border.subtle}`,
    },
    ghost: {
      backgroundColor: "transparent",
      color: colors.text.body,
      border: "none",
    },
  };

  const config = sizeMap[size] || sizeMap.md;

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      onKeyDown={disabled ? undefined : onKeyDown}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-describedby={ariaDescribedBy}
      title={title}
      tabIndex={tabIndex}
      style={{
        height: config.height,
        padding: `0 ${config.px}px`,
        borderRadius: radius.sm,
        fontFamily: typography.family,
        fontSize: config.fontSize,
        fontWeight: typography.weight.medium,
        lineHeight: typography.lineHeight.base,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing[2],
        minWidth: 44,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background-color .2s ease, border-color .2s ease, color .2s ease, box-shadow .2s ease",
        outline: "none",
        width: fullWidth ? "100%" : "auto",
        ...variantMap[variant],
        ...style,
      }}
    >
      {Icon && <Icon size={16} aria-hidden="true" focusable="false" />}
      {children}
    </button>
  );
}
