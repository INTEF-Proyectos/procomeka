import type { ReactNode } from "react";
import "./PageHeader.css";

export interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`page-header ${className}`.trim()}>
      <div className="page-header-content">
        {eyebrow && <span className="page-header-eyebrow">{eyebrow}</span>}
        <h1 className="page-header-title">{title}</h1>
        {description && <p className="page-header-description">{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}
