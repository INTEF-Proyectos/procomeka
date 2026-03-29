// Skeleton.tsx
import "./Skeleton.css";

export interface SkeletonProps {
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string;
  height?: string;
  lines?: number;
  className?: string;
}

export function Skeleton({
  variant = "text",
  width,
  height,
  lines = 1,
  className = "",
}: SkeletonProps) {
  if (variant === "card") {
    return (
      <div className={`skeleton-card ${className}`.trim()} aria-hidden="true">
        <div className="skeleton skeleton-rectangular" style={{ height: "160px" }} />
        <div className="skeleton-card-body">
          <div className="skeleton skeleton-text" style={{ width: "75%" }} />
          <div className="skeleton skeleton-text" style={{ width: "100%" }} />
          <div className="skeleton skeleton-text" style={{ width: "60%" }} />
          <div className="skeleton-card-footer">
            <div className="skeleton skeleton-circular" style={{ width: "24px", height: "24px" }} />
            <div className="skeleton skeleton-text" style={{ width: "120px" }} />
          </div>
        </div>
      </div>
    );
  }

  if (lines > 1) {
    return (
      <div className={`skeleton-lines ${className}`.trim()} aria-hidden="true">
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className="skeleton skeleton-text"
            style={{ width: i === lines - 1 ? "70%" : "100%" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`skeleton skeleton-${variant} ${className}`.trim()}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
