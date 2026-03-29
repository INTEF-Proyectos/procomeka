// Button.tsx
import type { ReactNode, ButtonHTMLAttributes } from "react";
import "./Button.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: "start" | "end";
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "start",
  fullWidth = false,
  loading = false,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      className={`btn btn-${variant} btn-${size}${fullWidth ? " btn-full" : ""}${loading ? " btn-loading" : ""} ${className}`.trim()}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="btn-spinner" aria-hidden="true" />}
      {icon && iconPosition === "start" && !loading && (
        <span className="material-symbols-outlined btn-icon" aria-hidden="true">{icon}</span>
      )}
      <span className="btn-label">{children}</span>
      {icon && iconPosition === "end" && !loading && (
        <span className="material-symbols-outlined btn-icon" aria-hidden="true">{icon}</span>
      )}
    </button>
  );
}
