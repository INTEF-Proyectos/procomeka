import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { readUploadContent } from "./uploads.ts";
import { buildElpxMap, buildElpxPreview, parsePagination } from "../helpers.ts";
import { getDb } from "../db.ts";
import * as repo from "@procomeka/db/repository";
import { user } from "@procomeka/db/schema";
const publicRoutes = new Hono();

publicRoutes.get("/resources", async (c) => {
	const { limit, offset, search } = parsePagination(c);
	const resourceType = c.req.query("resourceType") ?? undefined;
	const language = c.req.query("language") ?? undefined;
	const license = c.req.query("license") ?? undefined;

	const result = await repo.listResources(getDb().db, {
		limit,
		offset,
		search,
		status: "published",
		resourceType,
		language,
		license,
	});

	// Enrich with elpx preview URLs
	const resourceIds = result.data.map((r: { id: string }) => r.id);
	const elpxProjects = await repo.listElpxProjectsByResourceIds(getDb().db, resourceIds);
	const elpxMap = buildElpxMap(elpxProjects);

	const data = result.data.map((r: Record<string, unknown>) => {
		const elpxPreview = buildElpxPreview(elpxMap.get(r.id as string));
		return {
			...r,
			elpxPreview,
			favoriteCount: Number(r.favoriteCount ?? 0),
			rating: {
				average: Math.round(Number(r.ratingAvg ?? 0) * 100) / 100,
				count: Number(r.ratingCount ?? 0),
			},
		};
	});

	return c.json({ ...result, data });
});

publicRoutes.get("/resources/:slug", async (c) => {
	const { slug } = c.req.param();
	const resource = await repo.getResourceBySlug(getDb().db, slug);
	if (!resource) {
		return c.json({ error: "Recurso no encontrado" }, 404);
	}

	// Published resources are visible to everyone
	// Non-published resources: check session to see if user is owner/curator/admin
	if (resource.editorialStatus !== "published") {
		let user: { id: string; role?: string } | null = null;
		try {
			const result = await import("../auth/config.ts").then((m) => m.auth.api.getSession({ headers: c.req.raw.headers }));
			if (result) user = result.user as { id: string; role?: string };
		} catch {
			// No session — treat as anonymous
		}

		if (!user) {
			return c.json({ error: "Recurso no encontrado" }, 404);
		}
		const isOwner = resource.createdBy === user.id;
		const HIGH_ROLES = ["curator", "admin"];
		const isHighRole = HIGH_ROLES.includes(user.role ?? "");
		if (!isOwner && !isHighRole) {
			return c.json({ error: "Recurso no encontrado" }, 404);
		}
	}

	// Include elpx preview URL if the resource has an associated eXeLearning project
	const elpx = await repo.getElpxProjectByResourceId(getDb().db, resource.id);
	return c.json({ ...resource, elpxPreview: buildElpxPreview(elpx) });
});

publicRoutes.get("/uploads/:id/content", async (c) => {
	const { id } = c.req.param();
	const session = await repo.getUploadSessionById(getDb().db, id);
	if (!session || session.status !== "completed" || !session.mediaItemId) {
		return c.json({ error: "Archivo no encontrado" }, 404);
	}

	const resource = await repo.getResourceById(getDb().db, session.resourceId);
	if (!resource || resource.editorialStatus !== "published") {
		return c.json({ error: "Archivo no encontrado" }, 404);
	}

	const body = await readUploadContent(id).catch(() => null);
	if (!body) {
		return c.json({ error: "Archivo no encontrado" }, 404);
	}

	return new Response(body, {
		status: 200,
		headers: {
			"Content-Type": session.mimeType ?? "application/octet-stream",
			"Content-Disposition": `attachment; filename="${session.originalFilename}"`,
		},
	});
});

publicRoutes.get("/taxonomies/:type", async (c) => {
	const { type } = c.req.param();
	const result = await repo.listTaxonomies(getDb().db, { type, limit: 100 });
	return c.json(result.data);
});

publicRoutes.get("/collections", async (c) => {
	const { limit, offset, search } = parsePagination(c);
	const result = await repo.listCollections(getDb().db, {
		limit,
		offset,
		search,
		status: "published",
		resourceStatus: "published",
	});

	// Enrich each collection with elpx preview of its first resource
	// Phase 1: fetch first resource per collection in parallel
	const db = getDb().db;
	const firstResourceByCollection = new Map<string, string>();
	await Promise.all(result.data.map(async (col: { id: string }) => {
		try {
			const colResources = await repo.listCollectionResources(db, col.id, { limit: 1, status: "published" });
			if (colResources.length > 0) {
				const firstRes = colResources[0] as { resourceId: string };
				firstResourceByCollection.set(col.id, firstRes.resourceId);
			}
		} catch { /* ignore enrichment errors */ }
	}));

	// Phase 2: single batch elpx lookup for all first resources
	const allFirstResourceIds = [...new Set(firstResourceByCollection.values())];
	const elpxMap = allFirstResourceIds.length > 0
		? buildElpxMap(await repo.listElpxProjectsByResourceIds(db, allFirstResourceIds))
		: new Map();

	const enriched = result.data.map((col: { id: string }) => {
		const resourceId = firstResourceByCollection.get(col.id);
		const elpx = resourceId ? elpxMap.get(resourceId) : undefined;
		return { ...col, elpxPreview: buildElpxPreview(elpx ?? null) };
	});

	return c.json({ ...result, data: enriched });
});

publicRoutes.get("/collections/:slug", async (c) => {
	const { slug } = c.req.param();
	const collection = await repo.getCollectionBySlug(getDb().db, slug, {
		status: "published",
		resourceStatus: "published",
	});
	if (!collection) {
		return c.json({ error: "Colección no encontrada" }, 404);
	}

	const resources = await repo.listCollectionResources(getDb().db, collection.id, {
		limit: 100,
		status: "published",
	});

	// Enrich resources with elpx preview
	const resourceIds = resources.map((r: { resourceId: string }) => r.resourceId).filter(Boolean);
	let enrichedResources = resources;
	if (resourceIds.length > 0) {
		const elpxProjects = await repo.listElpxProjectsByResourceIds(getDb().db, resourceIds);
		const elpxMap = buildElpxMap(elpxProjects);
		enrichedResources = resources.map((r: { resourceId: string }) => {
			return { ...r, elpxPreview: buildElpxPreview(elpxMap.get(r.resourceId)) };
		});
	}

	return c.json({ ...collection, resources: enrichedResources });
});

publicRoutes.get("/config/badges", async (c) => {
	const settings = await repo.getAllSettings(getDb().db);
	return c.json({
		novedadDays: Number(settings.badge_novedad_days ?? "30"),
		destacadoMinRatings: Number(settings.badge_destacado_min_ratings ?? "3"),
		destacadoMinAvg: Number(settings.badge_destacado_min_avg ?? "4.0"),
		destacadoMinFavorites: Number(settings.badge_destacado_min_favorites ?? "3"),
	});
});

publicRoutes.get("/stats", async (c) => {
	const db = getDb().db;
	const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(user);
	return c.json({
		users: Number(userCount?.count ?? 0),
	});
});

export { publicRoutes };
