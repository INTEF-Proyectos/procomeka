import type { ReactNode } from "react";
import "./ResourceGrid.css";

export interface ResourceGridProps {
  view?: "grid" | "list";
  children: ReactNode;
  className?: string;
}

export function ResourceGrid({
  view = "grid",
  children,
  className = "",
}: ResourceGridProps) {
  return (
    <div className={`resource-grid resource-grid-${view} ${className}`.trim()}>
      {children}
    </div>
  );
}
