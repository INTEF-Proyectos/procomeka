import { Hono } from "hono";
import { type AuthEnv, sessionMiddleware, requireAuth } from "../auth/middleware.ts";
import { parsePagination, logActivity } from "../helpers.ts";
import { getDb } from "../db.ts";
import { eq, and, sql, desc, isNull } from "drizzle-orm";
import {
	ratings,
	favorites,
	downloads,
	activityEvents,
	resources,
	user,
} from "@procomeka/db/schema";
import * as repo from "@procomeka/db/repository";

const socialRoutes = new Hono<AuthEnv>();

// Note: sessionMiddleware is applied externally (in index.ts) so tests can mock auth.

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Enrich an array of resources with elpxPreview + social aggregates */
async function enrichResources<T extends { id: string }>(rows: T[]) {
	if (rows.length === 0) return [] as (T & { elpxPreview: { hash: string; previewUrl: string } | null; favoriteCount: number; rating: { average: number; count: number } })[];
	const db = getDb().db;
	const resourceIds = rows.map((r) => r.id);

	// Elpx preview
	const elpxList = await repo.listElpxProjectsByResourceIds(db, resourceIds);
	const elpxMap = new Map(elpxList.map((e: { resourceId: string; hash: string; hasPreview: number }) => [e.resourceId, e]));

	// Social aggregates — one query per resource (simple, works everywhere)
	const socialMap = new Map<string, { favCount: number; ratingAvg: number; ratingCount: number }>();
	for (const rid of resourceIds) {
		const [favResult, ratResult] = await Promise.all([
			db.select({ count: sql<number>`count(*)` }).from(favorites).where(eq(favorites.resourceId, rid)),
			db.select({ avg: sql<number>`coalesce(avg(${ratings.score}), 0)`, count: sql<number>`count(*)` }).from(ratings).where(eq(ratings.resourceId, rid)),
		]);
		socialMap.set(rid, {
			favCount: Number(favResult[0]?.count ?? 0),
			ratingAvg: Number(ratResult[0]?.avg ?? 0),
			ratingCount: Number(ratResult[0]?.count ?? 0),
		});
	}

	return rows.map((r) => {
		const elpx = elpxMap.get(r.id);
		const elpxPreview = elpx?.hasPreview === 1
			? { hash: elpx.hash, previewUrl: `/api/v1/elpx/${elpx.hash}/` }
			: null;
		const social = socialMap.get(r.id);
		return {
			...r,
			elpxPreview,
			favoriteCount: social?.favCount ?? 0,
			rating: { average: Math.round((social?.ratingAvg ?? 0) * 100) / 100, count: social?.ratingCount ?? 0 },
		};
	});
}

async function resolveResourceBySlug(slug: string) {
	const db = getDb().db;
	const rows = await db
		.select({ id: resources.id, title: resources.title, slug: resources.slug, editorialStatus: resources.editorialStatus })
		.from(resources)
		.where(and(eq(resources.slug, slug), isNull(resources.deletedAt)))
		.limit(1);
	return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// GET /resources/:slug/ratings
// ---------------------------------------------------------------------------
socialRoutes.get("/resources/:slug/ratings", async (c) => {
	const { slug } = c.req.param();
	const resource = await resolveResourceBySlug(slug);
	if (!resource) {
		return c.json({ error: "Recurso no encontrado" }, 404);
	}

	const db = getDb().db;
	const rows = await db
		.select({
			score: ratings.score,
			count: sql<number>`count(*)`,
		})
		.from(ratings)
		.where(eq(ratings.resourceId, resource.id))
		.groupBy(ratings.score);

	let totalRatings = 0;
	let totalScore = 0;
	const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
	for (const row of rows) {
		const count = Number(row.count);
		distribution[row.score] = count;
		totalRatings += count;
		totalScore += row.score * count;
	}

	// Check if current user has rated this resource
	let userScore: number | null = null;
	const currentUser = c.get("user");
	if (currentUser) {
		const userRating = await db
			.select({ score: ratings.score })
			.from(ratings)
			.where(and(eq(ratings.resourceId, resource.id), eq(ratings.userId, currentUser.id)))
			.limit(1);
		if (userRating[0]) userScore = userRating[0].score;
	}

	return c.json({
		resourceId: resource.id,
		averageScore: totalRatings > 0 ? Math.round((totalScore / totalRatings) * 100) / 100 : 0,
		totalRatings,
		distribution,
		userScore,
	});
});

// ---------------------------------------------------------------------------
// POST /resources/:slug/ratings (auth required)
// ---------------------------------------------------------------------------
socialRoutes.post("/resources/:slug/ratings", requireAuth, async (c) => {
	const { slug } = c.req.param();
	const currentUser = c.get("user")!;
	const body = await c.req.json<{ score: number }>();

	if (!body.score || body.score < 1 || body.score > 5 || !Number.isInteger(body.score)) {
		return c.json({ error: "La puntuacion debe ser un entero entre 1 y 5" }, 400);
	}

	const resource = await resolveResourceBySlug(slug);
	if (!resource) {
		return c.json({ error: "Recurso no encontrado" }, 404);
	}

	const db = getDb().db;
	const now = new Date();

	// Check if rating already exists (upsert)
	const existing = await db
		.select({ id: ratings.id })
		.from(ratings)
		.where(and(eq(ratings.resourceId, resource.id), eq(ratings.userId, currentUser.id)))
		.limit(1);

	if (existing[0]) {
		await db
			.update(ratings)
			.set({ score: body.score, updatedAt: now })
			.where(eq(ratings.id, existing[0].id));
	} else {
		await db.insert(ratings).values({
			id: crypto.randomUUID(),
			resourceId: resource.id,
			userId: currentUser.id,
			score: body.score,
			createdAt: now,
			updatedAt: now,
		});
	}

	await logActivity({
		userId: currentUser.id,
		type: "rating_given",
		resourceId: resource.id,
		resourceTitle: resource.title,
		resourceSlug: resource.slug,
		description: `Valoraste «${resource.title}» con ${body.score} estrellas`,
		metadata: { score: body.score },
	});

	return c.json({
		resourceId: resource.id,
		userId: currentUser.id,
		score: body.score,
		createdAt: now.toISOString(),
	});
});

// ---------------------------------------------------------------------------
// POST /resources/:slug/favorite (auth required - toggle)
// ---------------------------------------------------------------------------
socialRoutes.post("/resources/:slug/favorite", requireAuth, async (c) => {
	const { slug } = c.req.param();
	const currentUser = c.get("user")!;

	const resource = await resolveResourceBySlug(slug);
	if (!resource) {
		return c.json({ error: "Recurso no encontrado" }, 404);
	}

	const db = getDb().db;

	const existing = await db
		.select({ id: favorites.id })
		.from(favorites)
		.where(and(eq(favorites.resourceId, resource.id), eq(favorites.userId, currentUser.id)))
		.limit(1);

	let favorited: boolean;
	if (existing[0]) {
		await db.delete(favorites).where(eq(favorites.id, existing[0].id));
		favorited = false;
	} else {
		await db.insert(favorites).values({
			id: crypto.randomUUID(),
			resourceId: resource.id,
			userId: currentUser.id,
			createdAt: new Date(),
		});
		favorited = true;
	}

	await logActivity({
		userId: currentUser.id,
		type: favorited ? "favorite_added" : "favorite_removed",
		resourceId: resource.id,
		resourceTitle: resource.title,
		resourceSlug: resource.slug,
		description: favorited
			? `Marcaste como favorito «${resource.title}»`
			: `Quitaste de favoritos «${resource.title}»`,
	});

	// Return current count
	const countResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(favorites)
		.where(eq(favorites.resourceId, resource.id));

	return c.json({ favorited, count: Number(countResult[0]?.count ?? 0) });
});

// ---------------------------------------------------------------------------
// GET /users/me/favorites (auth required)
// ---------------------------------------------------------------------------
socialRoutes.get("/users/me/favorites", requireAuth, async (c) => {
	const { limit, offset } = parsePagination(c);
	const currentUser = c.get("user")!;
	const db = getDb().db;

	const rows = await db
		.select({
			id: resources.id,
			slug: resources.slug,
			title: resources.title,
			description: resources.description,
			language: resources.language,
			license: resources.license,
			resourceType: resources.resourceType,
			keywords: resources.keywords,
			author: resources.author,
			publisher: resources.publisher,
			editorialStatus: resources.editorialStatus,
			createdBy: resources.createdBy,
			createdAt: resources.createdAt,
			updatedAt: resources.updatedAt,
			favoritedAt: favorites.createdAt,
		})
		.from(favorites)
		.innerJoin(resources, eq(favorites.resourceId, resources.id))
		.where(and(eq(favorites.userId, currentUser.id), isNull(resources.deletedAt)))
		.orderBy(desc(favorites.createdAt))
		.limit(limit)
		.offset(offset);

	const countResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(favorites)
		.innerJoin(resources, eq(favorites.resourceId, resources.id))
		.where(and(eq(favorites.userId, currentUser.id), isNull(resources.deletedAt)));

	const enriched = await enrichResources(rows);
	return c.json({
		data: enriched,
		total: Number(countResult[0]?.count ?? 0),
		limit,
		offset,
	});
});

// ---------------------------------------------------------------------------
// GET /users/me/ratings (auth required)
// ---------------------------------------------------------------------------
socialRoutes.get("/users/me/ratings", requireAuth, async (c) => {
	const { limit, offset } = parsePagination(c);
	const currentUser = c.get("user")!;
	const db = getDb().db;

	const rows = await db
		.select({
			id: resources.id,
			slug: resources.slug,
			title: resources.title,
			description: resources.description,
			language: resources.language,
			license: resources.license,
			resourceType: resources.resourceType,
			author: resources.author,
			editorialStatus: resources.editorialStatus,
			createdAt: resources.createdAt,
			userScore: ratings.score,
			ratedAt: ratings.createdAt,
		})
		.from(ratings)
		.innerJoin(resources, eq(ratings.resourceId, resources.id))
		.where(and(eq(ratings.userId, currentUser.id), isNull(resources.deletedAt)))
		.orderBy(desc(ratings.createdAt))
		.limit(limit)
		.offset(offset);

	const countResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(ratings)
		.innerJoin(resources, eq(ratings.resourceId, resources.id))
		.where(and(eq(ratings.userId, currentUser.id), isNull(resources.deletedAt)));

	const enrichedRatings = await enrichResources(rows);
	return c.json({
		data: enrichedRatings,
		total: Number(countResult[0]?.count ?? 0),
		limit,
		offset,
	});
});

// ---------------------------------------------------------------------------
// GET /users/me/dashboard (auth required)
// ---------------------------------------------------------------------------
socialRoutes.get("/users/me/dashboard", requireAuth, async (c) => {
	const currentUser = c.get("user")!;
	const db = getDb().db;

	// Run count queries in parallel
	const [draftResult, publishedResult, favResult, ratingCountResult, recentResources] = await Promise.all([
		db.select({ count: sql<number>`count(*)` }).from(resources)
			.where(and(eq(resources.createdBy, currentUser.id), eq(resources.editorialStatus, "draft"), isNull(resources.deletedAt))),
		db.select({ count: sql<number>`count(*)` }).from(resources)
			.where(and(eq(resources.createdBy, currentUser.id), eq(resources.editorialStatus, "published"), isNull(resources.deletedAt))),
		db.select({ count: sql<number>`count(*)` }).from(favorites)
			.where(eq(favorites.userId, currentUser.id)),
		db.select({ count: sql<number>`count(*)` }).from(ratings)
			.where(eq(ratings.userId, currentUser.id)),
		db.select({
			id: resources.id, slug: resources.slug, title: resources.title, description: resources.description,
			language: resources.language, license: resources.license, resourceType: resources.resourceType,
			keywords: resources.keywords, author: resources.author, publisher: resources.publisher,
			editorialStatus: resources.editorialStatus, createdBy: resources.createdBy,
			createdAt: resources.createdAt, updatedAt: resources.updatedAt,
		}).from(resources)
			.where(and(eq(resources.createdBy, currentUser.id), isNull(resources.deletedAt)))
			.orderBy(desc(resources.updatedAt))
			.limit(5),
	]);

	const enrichedRecent = await enrichResources(recentResources);
	return c.json({
		draftCount: Number(draftResult[0]?.count ?? 0),
		publishedCount: Number(publishedResult[0]?.count ?? 0),
		favoriteCount: Number(favResult[0]?.count ?? 0),
		ratingCount: Number(ratingCountResult[0]?.count ?? 0),
		recentResources: enrichedRecent,
	});
});

// ---------------------------------------------------------------------------
// GET /users/me/activity (auth required)
// ---------------------------------------------------------------------------
socialRoutes.get("/users/me/activity", requireAuth, async (c) => {
	const { limit, offset } = parsePagination(c);
	const currentUser = c.get("user")!;
	const db = getDb().db;

	const rows = await db
		.select({
			id: activityEvents.id,
			type: activityEvents.type,
			resourceId: activityEvents.resourceId,
			resourceTitle: activityEvents.resourceTitle,
			resourceSlug: activityEvents.resourceSlug,
			description: activityEvents.description,
			metadata: activityEvents.metadata,
			createdAt: activityEvents.createdAt,
		})
		.from(activityEvents)
		.where(eq(activityEvents.userId, currentUser.id))
		.orderBy(desc(activityEvents.createdAt))
		.limit(limit)
		.offset(offset);

	const countResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(activityEvents)
		.where(eq(activityEvents.userId, currentUser.id));

	return c.json({
		data: rows.map(r => ({
			...r,
			metadata: r.metadata ? JSON.parse(r.metadata) : null,
			createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
		})),
		total: Number(countResult[0]?.count ?? 0),
		limit,
		offset,
	});
});

// ---------------------------------------------------------------------------
// POST /resources/:slug/download (log download event)
// ---------------------------------------------------------------------------
socialRoutes.post("/resources/:slug/download", async (c) => {
	const { slug } = c.req.param();

	const resource = await resolveResourceBySlug(slug);
	if (!resource) {
		return c.json({ error: "Recurso no encontrado" }, 404);
	}

	const db = getDb().db;

	// userId is optional – anonymous downloads are allowed
	const currentUser = c.get("user") as { id: string } | undefined;

	await db.insert(downloads).values({
		id: crypto.randomUUID(),
		resourceId: resource.id,
		userId: currentUser?.id ?? null,
		createdAt: new Date(),
	});

	if (currentUser?.id) {
		await logActivity({
			userId: currentUser.id,
			type: "resource_downloaded",
			resourceId: resource.id,
			resourceTitle: resource.title,
			resourceSlug: resource.slug,
			description: `Descargaste «${resource.title}»`,
		});
	}

	const countResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(downloads)
		.where(eq(downloads.resourceId, resource.id));

	return c.json({ count: Number(countResult[0]?.count ?? 0) });
});

// ---------------------------------------------------------------------------
// GET /resources/:slug/stats (aggregated social stats)
// ---------------------------------------------------------------------------
socialRoutes.get("/resources/:slug/stats", async (c) => {
	const { slug } = c.req.param();

	const resource = await resolveResourceBySlug(slug);
	if (!resource) {
		return c.json({ error: "Recurso no encontrado" }, 404);
	}

	const db = getDb().db;
	const rid = resource.id;

	const [dlResult, favResult, ratingResult] = await Promise.all([
		db
			.select({ count: sql<number>`count(*)` })
			.from(downloads)
			.where(eq(downloads.resourceId, rid)),
		db
			.select({ count: sql<number>`count(*)` })
			.from(favorites)
			.where(eq(favorites.resourceId, rid)),
		db
			.select({
				avg: sql<number>`coalesce(avg(${ratings.score}), 0)`,
				count: sql<number>`count(*)`,
			})
			.from(ratings)
			.where(eq(ratings.resourceId, rid)),
	]);

	// Check if current user has favorited this resource
	let userFavorited = false;
	const currentUser = c.get("user");
	if (currentUser) {
		const fav = await db
			.select({ id: favorites.id })
			.from(favorites)
			.where(and(eq(favorites.resourceId, rid), eq(favorites.userId, currentUser.id)))
			.limit(1);
		userFavorited = fav.length > 0;
	}

	return c.json({
		downloadCount: Number(dlResult[0]?.count ?? 0),
		favoriteCount: Number(favResult[0]?.count ?? 0),
		ratingAvg: Math.round(Number(ratingResult[0]?.avg ?? 0) * 100) / 100,
		ratingCount: Number(ratingResult[0]?.count ?? 0),
		userFavorited,
	});
});

export { socialRoutes };
