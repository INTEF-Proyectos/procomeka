// IconButton.tsx
import type { ButtonHTMLAttributes } from "react";
import "./IconButton.css";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "ghost";
}

export function IconButton({
  icon,
  label,
  size = "md",
  variant = "default",
  className = "",
  ...rest
}: IconButtonProps) {
  return (
    <button
      className={`icon-btn icon-btn-${size} icon-btn-${variant} ${className}`.trim()}
      aria-label={label}
      title={label}
      {...rest}
    >
      <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
    </button>
  );
}
