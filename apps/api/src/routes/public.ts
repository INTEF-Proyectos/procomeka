import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { readUploadContent } from "./uploads.ts";
import { contentDisposition } from "../uploads/config.ts";
import { getDb } from "../db.ts";
import * as repo from "@procomeka/db/repository";
import { user } from "@procomeka/db/schema";
import { buildElpxPreview } from "../elpx/preview.ts";
import { parsePagination } from "../http/pagination.ts";
import { canViewResource, getSessionUser } from "../public/access.ts";
import {
	listPublishedCollectionResources,
	listPublishedCollections,
	listPublishedResources,
} from "../public/service.ts";
const publicRoutes = new Hono();

publicRoutes.get("/resources", async (c) => {
	const { limit, offset, search } = parsePagination(c);
	const resourceType = c.req.query("resourceType") ?? undefined;
	const language = c.req.query("language") ?? undefined;
	const license = c.req.query("license") ?? undefined;
	return c.json(
		await listPublishedResources({
			limit,
			offset,
			search,
			resourceType,
			language,
			license,
		}),
	);
});

publicRoutes.get("/resources/:slug", async (c) => {
	const { slug } = c.req.param();
	const resource = await repo.getResourceBySlug(getDb().db, slug);
	if (!resource) {
		return c.json({ error: "Recurso no encontrado" }, 404);
	}

	const currentUser = await getSessionUser(c);
	if (!canViewResource(currentUser, resource)) {
		return c.json({ error: "Recurso no encontrado" }, 404);
	}

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
			"Content-Disposition": contentDisposition("attachment", session.originalFilename),
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
	return c.json(await listPublishedCollections({ limit, offset, search }));
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

	return c.json({
		...collection,
		resources: await listPublishedCollectionResources(collection.id),
	});
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
