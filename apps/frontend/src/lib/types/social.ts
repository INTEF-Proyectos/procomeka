/** Aggregate rating summary for a resource */
export interface RatingSummary {
  resourceId: string;
  averageScore: number;
  totalRatings: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

/** A single user's rating of a resource */
export interface UserRating {
  resourceId: string;
  userId: string;
  score: number;
  createdAt: string;
}

/** A user's favorite/bookmark of a resource */
export interface Favorite {
  resourceId: string;
  userId: string;
  createdAt: string;
}
