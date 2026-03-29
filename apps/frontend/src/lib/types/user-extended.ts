import type { ResourceSummary } from "./resource-extended.ts";

/** Public-facing user profile */
export interface PublicUserProfile {
  id: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
  role: string;
  resourceCount: number;
  favoriteCount: number;
  joinedAt: string;
}

/** Activity item for the dashboard feed */
export interface ActivityItem {
  id: string;
  type: "resource_published" | "resource_drafted" | "comment_posted" | "rating_given" | "favorite_added";
  resourceId?: string;
  resourceTitle?: string;
  resourceSlug?: string;
  description: string;
  createdAt: string;
}

/** Summary data for the user dashboard */
export interface DashboardSummary {
  user: PublicUserProfile;
  recentResources: ResourceSummary[];
  draftCount: number;
  publishedCount: number;
  favoriteCount: number;
  recentActivity: ActivityItem[];
}
