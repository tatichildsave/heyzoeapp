import React from "react";
import { X } from "lucide-react";
import { colors } from "../tokens/colors";
import { radius } from "../tokens/radius";
import { shadows } from "../tokens/shadows";
import { spacing } from "../tokens/spacing";
import { typography } from "../tokens/typography";

let dialogIdCounter = 0;

export function Dialog({ open, title, description, children, onClose, footer, closeOnOverlayClick = true, closeLabel = "Close dialog" }) {
  const generatedId = React.useMemo(() => {
    dialogIdCounter += 1;
    return `ds-dialog-${dialogIdCounter}`;
  }, []);
  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;
  const overlayRef = React.useRef(null);
  const panelRef = React.useRef(null);
  const closeBtnRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const previousActive = document.activeElement;
    const timeout = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 0);

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusables = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("keydown", onKey);
      if (previousActive && previousActive.focus) previousActive.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="presentation"
      onMouseDown={(e) => {
        if (!closeOnOverlayClick) return;
        if (e.target === overlayRef.current) onClose?.();
      }}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: colors.bg.overlay,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: spacing[4],
        zIndex: 1000,
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        style={{
          width: "100%",
          maxWidth: 520,
          backgroundColor: colors.bg.elevated,
          borderRadius: radius.lg,
          boxShadow: shadows.lg,
          border: `1px solid ${colors.border.soft}`,
          padding: spacing[5],
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: spacing[3] }}>
          <div>
            {title && (
              <h2
                id={titleId}
                style={{
                  margin: 0,
                  fontFamily: typography.family,
                  fontSize: typography.size.xl,
                  fontWeight: typography.weight.semibold,
                  color: colors.text.strong,
                }}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                id={descriptionId}
                style={{
                  margin: `${spacing[2]}px 0 0`,
                  fontFamily: typography.family,
                  fontSize: typography.size.sm,
                  color: colors.text.muted,
                  lineHeight: typography.lineHeight.base,
                }}
              >
                {description}
              </p>
            )}
          </div>
          <button ref={closeBtnRef} type="button" onClick={onClose} aria-label={closeLabel} style={{ border: "none", background: "transparent", cursor: "pointer", color: colors.text.muted, minWidth: 36, minHeight: 36 }}>
            <X size={18} aria-hidden="true" focusable="false" />
          </button>
        </div>

        <div style={{ marginTop: spacing[4] }}>{children}</div>

        {footer && <div style={{ marginTop: spacing[5] }}>{footer}</div>}
      </div>
    </div>
  );
}
