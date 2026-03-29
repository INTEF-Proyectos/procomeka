import { Hono } from "hono";
import { type AuthEnv, sessionMiddleware, requireAuth } from "../auth/middleware.ts";
import { parsePagination } from "../helpers.ts";
import { getDb } from "../db.ts";
import { eq, and, sql, desc, isNull, asc } from "drizzle-orm";
import {
	ratings,
	favorites,
	comments,
	commentVotes,
	downloads,
	resources,
	user,
} from "@procomeka/db/schema";
import * as repo from "@procomeka/db/repository";

const socialRoutes = new Hono<AuthEnv>();

// Apply session middleware to all social routes so user is available when authenticated
socialRoutes.use("*", sessionMiddleware);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function resolveResourceBySlug(slug: string) {
	const db = getDb().db;
	const rows = await db
		.select({ id: resources.id, editorialStatus: resources.editorialStatus })
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

	return c.json({
		resourceId: resource.id,
		userId: currentUser.id,
		score: body.score,
		createdAt: now.toISOString(),
	});
});

// ---------------------------------------------------------------------------
// GET /resources/:slug/comments
// ---------------------------------------------------------------------------
socialRoutes.get("/resources/:slug/comments", async (c) => {
	const { slug } = c.req.param();
	const { limit, offset } = parsePagination(c);

	const resource = await resolveResourceBySlug(slug);
	if (!resource) {
		return c.json({ error: "Recurso no encontrado" }, 404);
	}

	const db = getDb().db;

	// Fetch top-level comments (no parentId) that are not deleted
	const topLevelComments = await db
		.select({
			id: comments.id,
			resourceId: comments.resourceId,
			userId: comments.userId,
			userName: user.name,
			parentId: comments.parentId,
			body: comments.body,
			status: comments.status,
			createdAt: comments.createdAt,
			updatedAt: comments.updatedAt,
			deletedAt: comments.deletedAt,
		})
		.from(comments)
		.leftJoin(user, eq(comments.userId, user.id))
		.where(
			and(
				eq(comments.resourceId, resource.id),
				isNull(comments.parentId),
				isNull(comments.deletedAt),
			),
		)
		.orderBy(desc(comments.createdAt))
		.limit(limit)
		.offset(offset);

	// Count total top-level comments
	const countResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(comments)
		.where(
			and(
				eq(comments.resourceId, resource.id),
				isNull(comments.parentId),
				isNull(comments.deletedAt),
			),
		);
	const total = Number(countResult[0]?.count ?? 0);

	// Fetch replies for all top-level comments in batch
	const commentIds = topLevelComments.map((c: { id: string }) => c.id);
	let repliesMap = new Map<string, typeof topLevelComments>();

	if (commentIds.length > 0) {
		const allReplies = await db
			.select({
				id: comments.id,
				resourceId: comments.resourceId,
				userId: comments.userId,
				userName: user.name,
				parentId: comments.parentId,
				body: comments.body,
				status: comments.status,
				createdAt: comments.createdAt,
				updatedAt: comments.updatedAt,
				deletedAt: comments.deletedAt,
			})
			.from(comments)
			.leftJoin(user, eq(comments.userId, user.id))
			.where(
				and(
					sql`${comments.parentId} IN (${sql.join(commentIds.map((id: string) => sql`${id}`), sql`, `)})`,
					isNull(comments.deletedAt),
				),
			)
			.orderBy(asc(comments.createdAt));

		for (const reply of allReplies) {
			const parentId = reply.parentId!;
			if (!repliesMap.has(parentId)) repliesMap.set(parentId, []);
			repliesMap.get(parentId)!.push(reply);
		}
	}

	const data = topLevelComments.map((comment: { id: string }) => ({
		comment,
		replies: repliesMap.get(comment.id) ?? [],
	}));

	return c.json({ data, total, limit, offset });
});

// ---------------------------------------------------------------------------
// POST /resources/:slug/comments (auth required)
// ---------------------------------------------------------------------------
socialRoutes.post("/resources/:slug/comments", requireAuth, async (c) => {
	const { slug } = c.req.param();
	const currentUser = c.get("user")!;
	const body = await c.req.json<{ body: string; parentId?: string }>();

	if (!body.body?.trim()) {
		return c.json({ error: "El comentario no puede estar vacio" }, 400);
	}

	const resource = await resolveResourceBySlug(slug);
	if (!resource) {
		return c.json({ error: "Recurso no encontrado" }, 404);
	}

	const db = getDb().db;

	// Validate parentId if provided
	if (body.parentId) {
		const parentRows = await db
			.select({ id: comments.id, resourceId: comments.resourceId })
			.from(comments)
			.where(and(eq(comments.id, body.parentId), isNull(comments.deletedAt)))
			.limit(1);
		const parent = parentRows[0];
		if (!parent || parent.resourceId !== resource.id) {
			return c.json({ error: "Comentario padre no encontrado" }, 404);
		}
	}

	const id = crypto.randomUUID();
	const now = new Date();

	await db.insert(comments).values({
		id,
		resourceId: resource.id,
		userId: currentUser.id,
		parentId: body.parentId ?? null,
		body: body.body.trim(),
		status: "visible",
		createdAt: now,
		updatedAt: now,
	});

	return c.json({
		id,
		resourceId: resource.id,
		userId: currentUser.id,
		userName: (currentUser as any).name ?? null,
		parentId: body.parentId ?? null,
		body: body.body.trim(),
		status: "visible",
		createdAt: now.toISOString(),
		updatedAt: now.toISOString(),
	}, 201);
});

// ---------------------------------------------------------------------------
// PATCH /comments/:id (auth required - owner only)
// ---------------------------------------------------------------------------
socialRoutes.patch("/comments/:id", requireAuth, async (c) => {
	const { id } = c.req.param();
	const currentUser = c.get("user")!;
	const body = await c.req.json<{ body: string }>();

	if (!body.body?.trim()) {
		return c.json({ error: "El comentario no puede estar vacio" }, 400);
	}

	const db = getDb().db;
	const rows = await db
		.select({
			id: comments.id,
			userId: comments.userId,
			deletedAt: comments.deletedAt,
		})
		.from(comments)
		.where(eq(comments.id, id))
		.limit(1);

	const comment = rows[0];
	if (!comment || comment.deletedAt) {
		return c.json({ error: "Comentario no encontrado" }, 404);
	}

	if (comment.userId !== currentUser.id) {
		return c.json({ error: "Solo puedes editar tus propios comentarios" }, 403);
	}

	const now = new Date();
	await db
		.update(comments)
		.set({ body: body.body.trim(), updatedAt: now })
		.where(eq(comments.id, id));

	return c.json({
		id,
		body: body.body.trim(),
		updatedAt: now.toISOString(),
	});
});

// ---------------------------------------------------------------------------
// DELETE /comments/:id (auth required - owner or curator+)
// ---------------------------------------------------------------------------
socialRoutes.delete("/comments/:id", requireAuth, async (c) => {
	const { id } = c.req.param();
	const currentUser = c.get("user")!;
	const userRole = (currentUser as any).role ?? "reader";

	const db = getDb().db;
	const rows = await db
		.select({
			id: comments.id,
			userId: comments.userId,
			deletedAt: comments.deletedAt,
		})
		.from(comments)
		.where(eq(comments.id, id))
		.limit(1);

	const comment = rows[0];
	if (!comment || comment.deletedAt) {
		return c.json({ error: "Comentario no encontrado" }, 404);
	}

	const isCuratorOrAbove = ["curator", "admin"].includes(userRole);
	if (comment.userId !== currentUser.id && !isCuratorOrAbove) {
		return c.json({ error: "Permisos insuficientes" }, 403);
	}

	// Soft delete
	await db
		.update(comments)
		.set({ deletedAt: new Date(), updatedAt: new Date() })
		.where(eq(comments.id, id));

	return c.body(null, 204);
});

// ---------------------------------------------------------------------------
// POST /comments/:id/vote (auth required - toggle)
// ---------------------------------------------------------------------------
socialRoutes.post("/comments/:id/vote", requireAuth, async (c) => {
	const { id } = c.req.param();
	const currentUser = c.get("user")!;

	const db = getDb().db;

	// Check comment exists
	const commentRows = await db
		.select({ id: comments.id, deletedAt: comments.deletedAt })
		.from(comments)
		.where(eq(comments.id, id))
		.limit(1);

	if (!commentRows[0] || commentRows[0].deletedAt) {
		return c.json({ error: "Comentario no encontrado" }, 404);
	}

	// Toggle vote
	const existingVote = await db
		.select({ id: commentVotes.id })
		.from(commentVotes)
		.where(and(eq(commentVotes.commentId, id), eq(commentVotes.userId, currentUser.id)))
		.limit(1);

	if (existingVote[0]) {
		await db.delete(commentVotes).where(eq(commentVotes.id, existingVote[0].id));
		return c.json({ voted: false });
	}

	await db.insert(commentVotes).values({
		id: crypto.randomUUID(),
		commentId: id,
		userId: currentUser.id,
		voteType: "useful",
		createdAt: new Date(),
	});

	return c.json({ voted: true });
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

	return c.json({
		data: rows,
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

	return c.json({
		data: rows,
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

	return c.json({
		draftCount: Number(draftResult[0]?.count ?? 0),
		publishedCount: Number(publishedResult[0]?.count ?? 0),
		favoriteCount: Number(favResult[0]?.count ?? 0),
		ratingCount: Number(ratingCountResult[0]?.count ?? 0),
		recentResources,
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

	const [dlResult, favResult, ratingResult, commentResult] = await Promise.all([
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
		db
			.select({ count: sql<number>`count(*)` })
			.from(comments)
			.where(and(eq(comments.resourceId, rid), isNull(comments.deletedAt))),
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
		commentCount: Number(commentResult[0]?.count ?? 0),
		userFavorited,
	});
});

export { socialRoutes };
