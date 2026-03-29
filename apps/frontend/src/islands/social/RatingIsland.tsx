import { useEffect, useState } from "react";
import type { RatingSummary as RatingSummaryType } from "../../lib/types/social.ts";
import { RatingSummary } from "../../ui/RatingSummary.tsx";
import { StarRating } from "../../ui/StarRating.tsx";
import { getApiClient } from "../../lib/get-api-client.ts";
import "./RatingIsland.css";

export interface RatingIslandProps {
  resourceSlug: string;
  currentUserId?: string | null;
}

export function RatingIsland({ resourceSlug, currentUserId }: RatingIslandProps) {
  const [rating, setRating] = useState<RatingSummaryType | null>(null);
  const [userScore, setUserScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const api = await getApiClient();
        const data = await api.getResourceRatings(resourceSlug);
        const raw = data as Record<string, unknown>;
        setRating({
          resourceId: (raw.resourceId as string) ?? resourceSlug,
          averageScore: Number(raw.averageScore) || 0,
          totalRatings: Number(raw.totalRatings) || 0,
          distribution: (raw.distribution as Record<1|2|3|4|5, number>) ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
        // Load user's own rating if present
        if (raw.userScore != null) {
          setUserScore(Number(raw.userScore));
        }
      } catch {
        // No ratings available — show empty state
        setRating({
          resourceId: resourceSlug,
          averageScore: 0,
          totalRatings: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [resourceSlug]);

  async function handleRate(score: number) {
    if (!currentUserId || submitting) return;
    setSubmitting(true);
    try {
      const api = await getApiClient();
      const result = await api.submitRating(resourceSlug, score);
      setUserScore(result.score);
      const updated = await api.getResourceRatings(resourceSlug);
      setRating(updated as RatingSummaryType);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !rating) {
    return <p className="rating-loading">Cargando valoraciones...</p>;
  }

  return (
    <div className="rating-island">
      <h3 className="rating-island-title">Valoraciones</h3>
      <RatingSummary rating={rating} />
      {currentUserId && (
        <div className="rating-island-user">
          <p className="rating-island-label">
            {userScore > 0 ? "Tu valoración:" : "Valora este recurso:"}
          </p>
          <StarRating
            value={userScore}
            onChange={handleRate}
            size="lg"
          />
        </div>
      )}
    </div>
  );
}
