import type { RatingSummary as RatingSummaryType } from "../lib/types/social.ts";
import { StarRating } from "./StarRating.tsx";
import "./RatingSummary.css";

export interface RatingSummaryProps {
  rating: RatingSummaryType;
  className?: string;
}

export function RatingSummary({ rating, className = "" }: RatingSummaryProps) {
  const avg = Number(rating.averageScore) || 0;
  const total = Number(rating.totalRatings) || 0;
  const dist = rating.distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const maxCount = Math.max(...Object.values(dist), 1);

  return (
    <div className={`rating-summary ${className}`.trim()}>
      <div className="rating-summary-score">
        <span className="rating-summary-number">{avg.toFixed(1)}</span>
        <StarRating value={Math.round(avg)} readOnly size="md" />
        <span className="rating-summary-count">
          {total} {total === 1 ? "valoración" : "valoraciones"}
        </span>
      </div>
      <div className="rating-summary-bars" aria-hidden="true">
        {([5, 4, 3, 2, 1] as const).map((star) => (
          <div key={star} className="rating-summary-bar-row">
            <span className="rating-summary-bar-label">{star}</span>
            <div className="rating-summary-bar-track">
              <div
                className="rating-summary-bar-fill"
                style={{ width: `${((dist[star] ?? 0) / maxCount) * 100}%` }}
              />
            </div>
            <span className="rating-summary-bar-count">{dist[star] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
