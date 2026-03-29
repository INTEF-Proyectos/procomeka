import type { ResourceSummary } from "./resource-extended.ts";

/** Tag with optional usage count */
export interface Tag {
  id: string;
  slug: string;
  name: string;
  count?: number;
}

/** Educational context / level */
export interface EducationalContext {
  id: string;
  slug: string;
  name: string;
  level: string;
}

/** Subject area, potentially hierarchical */
export interface SubjectArea {
  id: string;
  slug: string;
  name: string;
  parentId?: string | null;
}

/** A curated collection of resources */
export interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string;
  resourceCount: number;
  thumbnailUrl?: string | null;
  curator?: { id: string; name: string } | null;
  editorialStatus: string;
  createdAt: string;
  updatedAt?: string;
}

/** A step within an ordered itinerary */
export interface ItineraryStep {
  position: number;
  resourceId: string;
  resource?: ResourceSummary;
  annotation?: string;
}

/** An ordered learning itinerary */
export interface Itinerary extends Collection {
  isOrdered: true;
  steps: ItineraryStep[];
}
