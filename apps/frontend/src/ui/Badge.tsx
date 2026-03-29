// Badge.tsx
import type { ReactNode } from "react";
import "./Badge.css";

export type BadgeVariant = "default" | "primary" | "success" | "warning" | "error" | "info" | "overlay";
export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: string;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = "default",
  size = "md",
  icon,
  children,
  className = "",
}: BadgeProps) {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`.trim()}>
      {icon && <span className="material-symbols-outlined badge-icon" aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
