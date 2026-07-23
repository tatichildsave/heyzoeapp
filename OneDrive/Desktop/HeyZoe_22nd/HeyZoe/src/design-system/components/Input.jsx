import React from "react";
import { colors } from "../tokens/colors";
import { radius } from "../tokens/radius";
import { spacing } from "../tokens/spacing";
import { typography } from "../tokens/typography";

let inputIdCounter = 0;

export function Input({
  id,
  label,
  hint,
  error,
  hideLabel = false,
  style,
  inputStyle,
  ariaLabel,
  ariaDescribedBy,
  required,
  ...rest
}) {
  const generatedId = React.useMemo(() => {
    inputIdCounter += 1;
    return `ds-input-${inputIdCounter}`;
  }, []);
  const inputId = id || generatedId;
  const hintId = hint ? `${inputId}-hint` : null;
  const errorId = error ? `${inputId}-error` : null;
  const describedBy = [ariaDescribedBy, errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <label htmlFor={inputId} style={{ display: "flex", flexDirection: "column", gap: spacing[2], ...style }}>
      {label && (
        <span
          style={{
            fontFamily: typography.family,
            fontSize: typography.size.sm,
            color: colors.text.body,
            fontWeight: typography.weight.medium,
            ...(hideLabel ? {
              position: "absolute",
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: "hidden",
              clip: "rect(0,0,0,0)",
              whiteSpace: "nowrap",
              border: 0,
            } : {}),
          }}
        >
          {label}
          {required ? " *" : ""}
        </span>
      )}
      <input
        {...rest}
        id={inputId}
        aria-label={ariaLabel || (hideLabel ? label : undefined)}
        aria-invalid={!!error}
        aria-required={required}
        aria-describedby={describedBy}
        style={{
          height: 44,
          borderRadius: radius.sm,
          border: `1px solid ${error ? colors.state.danger : colors.border.subtle}`,
          backgroundColor: colors.bg.surface,
          padding: `0 ${spacing[3]}px`,
          fontFamily: typography.family,
          fontSize: typography.size.md,
          color: colors.text.strong,
          outline: "none",
          minWidth: 0,
          ...inputStyle,
        }}
      />
      {(error || hint) && (
        <span
          id={error ? errorId : hintId}
          role={error ? "alert" : undefined}
          style={{
            fontFamily: typography.family,
            fontSize: typography.size.xs,
            color: error ? colors.state.danger : colors.text.muted,
          }}
        >
          {error || hint}
        </span>
      )}
    </label>
  );
}
