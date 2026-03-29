import type { ReactNode } from "react";
import "./MetadataList.css";

export interface MetadataItem {
  label: string;
  value: ReactNode;
}

export interface MetadataListProps {
  items: MetadataItem[];
  className?: string;
}

export function MetadataList({ items, className = "" }: MetadataListProps) {
  const visibleItems = items.filter((item) => item.value !== null && item.value !== undefined && item.value !== "");

  if (visibleItems.length === 0) return null;

  return (
    <dl className={`metadata-list ${className}`.trim()}>
      {visibleItems.map((item) => (
        <div key={item.label} className="metadata-list-item">
          <dt className="metadata-list-label">{item.label}</dt>
          <dd className="metadata-list-value">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
