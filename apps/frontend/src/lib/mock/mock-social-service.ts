import {
  MOCK_RESOURCES,
  MOCK_COMMENTS,
  MOCK_RATING,
  MOCK_DASHBOARD,
  MOCK_COLLECTIONS,
  MOCK_STATS,
} from "./mock-data.ts";
import type { ResourceSummary } from "../types/resource-extended.ts";
import type {
  CommentThread,
  RatingSummary,
  UserRating,
  Comment,
} from "../types/social.ts";
import type { DashboardSummary } from "../types/user-extended.ts";
import type { SearchResult } from "../types/search.ts";
import type { Collection } from "../types/collection-extended.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Simulate network latency (50-150 ms) */
function delay(ms?: number): Promise<void> {
  const wait = ms ?? 50 + Math.random() * 100;
  return new Promise((resolve) => setTimeout(resolve, wait));
}

/** In-memory state for toggles that persist during the session */
const favoritedSlugs = new Set<string>();
const downloadCounts = new Map<string, number>();
const userRatings = new Map<string, number>();
let commentCounter = 100;

// ---------------------------------------------------------------------------
// Search resources
// ---------------------------------------------------------------------------

export async function searchResources(opts?: {
  q?: string;
  resourceType?: string;
  language?: string;
  license?: string;
  page?: number;
  pageSize?: number;
}): Promise<SearchResult<ResourceSummary>> {
  await delay();

  const {
    q,
    resourceType,
    language,
    license,
    page = 1,
    pageSize = 12,
  } = opts ?? {};

  let filtered = [...MOCK_RESOURCES];

  if (q) {
    const lower = q.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.title.toLowerCase().includes(lower) ||
        r.description.toLowerCase().includes(lower),
    );
  }

  if (resourceType) {
    filtered = filtered.filter(
      (r) => r.resourceType.toLowerCase() === resourceType.toLowerCase(),
    );
  }

  if (language) {
    filtered = filtered.filter((r) => r.language === language);
  }

  if (license) {
    filtered = filtered.filter((r) => r.license === license);
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
    facets: [
      {
        key: "resourceType",
        label: "Tipo de recurso",
        items: [
          { value: "Secuencia Didactica", label: "Secuencia Didactica", count: 2 },
          { value: "Ejercicio Interactivo", label: "Ejercicio Interactivo", count: 1 },
          { value: "Video Educativo", label: "Video Educativo", count: 1 },
          { value: "Proyecto de Innovacion", label: "Proyecto de Innovacion", count: 2 },
          { value: "Guia Didactica", label: "Guia Didactica", count: 3 },
          { value: "Presentacion", label: "Presentacion", count: 1 },
          { value: "Objeto de Aprendizaje", label: "Objeto de Aprendizaje", count: 2 },
        ],
      },
      {
        key: "language",
        label: "Idioma",
        items: [
          { value: "es", label: "Espanol", count: 11 },
          { value: "en", label: "Ingles", count: 1 },
        ],
      },
      {
        key: "license",
        label: "Licencia",
        items: [
          { value: "cc-by", label: "CC BY", count: 2 },
          { value: "cc-by-sa", label: "CC BY-SA", count: 3 },
          { value: "cc-by-nc", label: "CC BY-NC", count: 3 },
          { value: "cc-by-nc-sa", label: "CC BY-NC-SA", count: 4 },
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Get a single resource detail
// ---------------------------------------------------------------------------

export async function getResourceDetail(slug: string) {
  await delay();

  const resource = MOCK_RESOURCES.find((r) => r.slug === slug);
  if (!resource) return null;

  const related = MOCK_RESOURCES.filter(
    (r) => r.slug !== slug,
  ).slice(0, 3);

  return {
    ...resource,
    rating: MOCK_RATING,
    favoriteCount: resource.favoriteCount ?? 0,
    userFavorited: favoritedSlugs.has(slug),
    userRating: userRatings.get(slug) ?? null,
    relatedResources: related,
  };
}

// ---------------------------------------------------------------------------
// Toggle favorite
// ---------------------------------------------------------------------------

export async function toggleFavorite(
  slug: string,
): Promise<{ favorited: boolean; count: number }> {
  await delay();

  const resource = MOCK_RESOURCES.find((r) => r.slug === slug);
  const baseCount = resource?.favoriteCount ?? 0;

  if (favoritedSlugs.has(slug)) {
    favoritedSlugs.delete(slug);
    return { favorited: false, count: baseCount };
  }

  favoritedSlugs.add(slug);
  return { favorited: true, count: baseCount + 1 };
}

// ---------------------------------------------------------------------------
// Submit rating
// ---------------------------------------------------------------------------

export async function submitRating(
  slug: string,
  score: number,
): Promise<UserRating> {
  await delay();

  const resource = MOCK_RESOURCES.find((r) => r.slug === slug);
  if (!resource) throw new Error(`Resource not found: ${slug}`);

  userRatings.set(slug, score);

  return {
    resourceId: resource.id,
    userId: "user-001",
    score,
    createdAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Get rating summary
// ---------------------------------------------------------------------------

export async function getResourceRatings(
  slug: string,
): Promise<RatingSummary> {
  await delay();

  const resource = MOCK_RESOURCES.find((r) => r.slug === slug);
  if (!resource) {
    return {
      resourceId: slug,
      averageScore: 0,
      totalRatings: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  return {
    ...MOCK_RATING,
    resourceId: resource.id,
  };
}

// ---------------------------------------------------------------------------
// List comments
// ---------------------------------------------------------------------------

export async function listComments(
  _slug: string,
): Promise<CommentThread[]> {
  await delay();
  return MOCK_COMMENTS;
}

// ---------------------------------------------------------------------------
// Create comment
// ---------------------------------------------------------------------------

export async function createComment(
  slug: string,
  body: string,
  parentId?: string,
): Promise<Comment> {
  await delay();

  commentCounter += 1;
  const resource = MOCK_RESOURCES.find((r) => r.slug === slug);
  const now = new Date().toISOString();

  const comment: Comment = {
    id: `com-${commentCounter}`,
    resourceId: resource?.id ?? slug,
    userId: "user-001",
    parentId: parentId ?? null,
    body,
    status: "visible",
    author: { id: "user-001", name: "Elena Martinez" },
    usefulCount: 0,
    userVotedUseful: false,
    createdAt: now,
    updatedAt: now,
  };

  return comment;
}

// ---------------------------------------------------------------------------
// Reply to comment
// ---------------------------------------------------------------------------

export async function replyToComment(
  parentId: string,
  body: string,
): Promise<Comment> {
  await delay();

  commentCounter += 1;
  const now = new Date().toISOString();

  const reply: Comment = {
    id: `com-${commentCounter}`,
    resourceId: "res-001",
    userId: "user-001",
    parentId,
    body,
    status: "visible",
    author: { id: "user-001", name: "Elena Martinez" },
    usefulCount: 0,
    userVotedUseful: false,
    createdAt: now,
    updatedAt: now,
  };

  return reply;
}

// ---------------------------------------------------------------------------
// Get dashboard summary
// ---------------------------------------------------------------------------

export async function getDashboardSummary(): Promise<DashboardSummary> {
  await delay();
  return {
    ...MOCK_DASHBOARD,
    recentResources: MOCK_RESOURCES.slice(0, 4),
  };
}

// ---------------------------------------------------------------------------
// Save draft
// ---------------------------------------------------------------------------

export async function saveDraft(
  data: Partial<ResourceSummary>,
): Promise<{ id: string; slug: string }> {
  await delay(100);

  const id = `res-draft-${Date.now()}`;
  const slug =
    data.slug ??
    (data.title ?? "borrador")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  return { id, slug };
}

// ---------------------------------------------------------------------------
// Submit for review
// ---------------------------------------------------------------------------

export async function submitForReview(
  _id: string,
): Promise<{ status: string }> {
  await delay(100);
  return { status: "pending_review" };
}

// ---------------------------------------------------------------------------
// Get featured resources
// ---------------------------------------------------------------------------

export async function getFeaturedResources(): Promise<ResourceSummary[]> {
  await delay();
  // Return the top-rated resources as "featured"
  return [...MOCK_RESOURCES]
    .sort((a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0))
    .slice(0, 6);
}

// ---------------------------------------------------------------------------
// Get collections
// ---------------------------------------------------------------------------

export async function getCollections(): Promise<Collection[]> {
  await delay();
  return MOCK_COLLECTIONS;
}

// ---------------------------------------------------------------------------
// Get stats
// ---------------------------------------------------------------------------

export async function getStats(): Promise<typeof MOCK_STATS> {
  await delay();
  return MOCK_STATS;
}

// ---------------------------------------------------------------------------
// Track download
// ---------------------------------------------------------------------------

export async function trackDownload(slug: string): Promise<{ count: number }> {
  await delay();
  // In-memory counter
  const key = `dl-${slug}`;
  const count = (downloadCounts.get(key) ?? Math.floor(Math.random() * 200)) + 1;
  downloadCounts.set(key, count);
  return { count };
}

// ---------------------------------------------------------------------------
// Get resource stats (aggregated)
// ---------------------------------------------------------------------------

export async function getResourceStats(slug: string): Promise<{ downloadCount: number; favoriteCount: number; ratingAvg: number; ratingCount: number; commentCount: number }> {
  await delay();
  const resource = MOCK_RESOURCES.find(r => r.slug === slug);
  return {
    downloadCount: Math.floor(Math.random() * 500) + 10,
    favoriteCount: resource?.favoriteCount ?? 0,
    ratingAvg: resource?.rating?.average ?? 0,
    ratingCount: resource?.rating?.count ?? 0,
    commentCount: MOCK_COMMENTS.length,
  };
}
