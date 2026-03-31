import { Hono } from "hono";
import { type AuthEnv, sessionMiddleware, requireAuth } from "../auth/middleware.ts";
import { getDb } from "../db.ts";
import { eq, and, sql, desc, isNull } from "drizzle-orm";
import {
	favorites,
	ratings,
	resources,
} from "@procomeka/db/schema";
import * as repo from "@procomeka/db/repository";
import { logActivity } from "../activity/log.ts";
import { parsePagination } from "../http/pagination.ts";
import { listUserActivity } from "../social/activity-service.ts";
import { getUserDashboardSummary } from "../social/dashboard-service.ts";
import { toggleResourceFavorite } from "../social/favorites-service.ts";
import { enrichResourceCards } from "../social/resource-card.ts";
import { resolveResourceBySlug } from "../social/resource-resolver.ts";
import { getResourceRatingsSummary, upsertResourceRating } from "../social/ratings-service.ts";
import { incrementDownload, getResourceSocialStats } from "../social/resource-stats-service.ts";

const socialRoutes = new Hono<AuthEnv>();

// Note: sessionMiddleware is applied externally (in index.ts) so tests can mock auth.

// ---------------------------------------------------------------------------
// GET /resources/:slug/ratings
// ---------------------------------------------------------------------------
socialRoutes.get("/resources/:slug/ratings", async (c) => {
	const { slug } = c.req.param();
	const resource = await resolveResourceBySlug(slug);
	if (!resource) {
		return c.json({ error: "Recurso no encontrado" }, 404);
	}

	const currentUser = c.get("user");
	const summary = await getResourceRatingsSummary(resource.id, currentUser?.id);
	return c.json({
		resourceId: resource.id,
		...summary,
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

	const result = await upsertResourceRating({
		resourceId: resource.id,
		userId: currentUser.id,
		score: body.score,
	});

	await logActivity({
		userId: currentUser.id,
		type: "rating_given",
		resourceId: resource.id,
		resourceTitle: resource.title,
		resourceSlug: resource.slug,
		description: `Valoraste «${resource.title}» con ${body.score} estrellas`,
		metadata: { score: body.score },
	});

	return c.json(result);
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

	const result = await toggleResourceFavorite({
		resourceId: resource.id,
		userId: currentUser.id,
	});

	await logActivity({
		userId: currentUser.id,
		type: result.favorited ? "favorite_added" : "favorite_removed",
		resourceId: resource.id,
		resourceTitle: resource.title,
		resourceSlug: resource.slug,
		description: result.favorited
			? `Marcaste como favorito «${resource.title}»`
			: `Quitaste de favoritos «${resource.title}»`,
	});

	return c.json(result);
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

	const enriched = await enrichResourceCards(rows);
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

	const enrichedRatings = await enrichResourceCards(rows);
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
	return c.json(await getUserDashboardSummary(currentUser.id));
});

// ---------------------------------------------------------------------------
// GET /users/me/activity (auth required)
// ---------------------------------------------------------------------------
socialRoutes.get("/users/me/activity", requireAuth, async (c) => {
	const { limit, offset } = parsePagination(c);
	const currentUser = c.get("user")!;
	return c.json(
		await listUserActivity({
			userId: currentUser.id,
			limit,
			offset,
		}),
	);
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

	const currentUser = c.get("user") as { id: string } | undefined;
	const count = await incrementDownload(resource.id, currentUser?.id);

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

	return c.json({ count });
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

	const currentUser = c.get("user");
	return c.json(await getResourceSocialStats(resource.id, currentUser?.id));
});

export { socialRoutes };
