import type { Resource, MediaItemRecord } from "../../lib/api-client.ts";
import type { RatingSummary } from "./social.ts";

/** License metadata with display info */
export interface ResourceLicense {
  code: string;
  label: string;
  url: string;
  iconUrl?: string;
}

/** Compact resource representation for cards and lists */
export interface ResourceSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  resourceType: string;
  language: string;
  license: string;
  author?: string | null;
  thumbnailUrl?: string | null;
  elpxPreview?: { hash: string; previewUrl: string } | null;
  rating?: { average: number; count: number };
  favoriteCount?: number;
  editorialStatus: string;
  createdAt: string;
}

/** Full resource detail with social data and relations */
export interface ResourceDetail extends Resource {
  rating: RatingSummary;
  favoriteCount: number;
  userFavorited?: boolean;
  userRating?: number | null;
  relatedResources: ResourceSummary[];
}

/** Structured resource metadata for display in metadata panels */
export interface ResourceMetadata {
  author?: string | null;
  publisher?: string | null;
  language: string;
  license: ResourceLicense;
  resourceType: string;
  subjects: string[];
  levels: string[];
  keywords: string[];
  duration?: number | null;
  accessibilityFeatures?: string | null;
  createdAt: string;
  updatedAt: string;
}
