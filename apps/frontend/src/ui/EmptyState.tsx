// EmptyState.tsx
import type { ReactNode } from "react";
import "./EmptyState.css";

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon = "search_off",
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`.trim()} role="status">
      <span className="material-symbols-outlined empty-state-icon" aria-hidden="true">{icon}</span>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
