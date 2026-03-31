import { Hono } from "hono";
import { type AuthEnv, requireRole } from "../../auth/middleware.ts";
import { getCurrentUser, hasMinRole, canManageResource } from "../../auth/roles.ts";
import { logActivity } from "../../activity/log.ts";
import { ensureCurrentUser } from "../../auth/user-sync.ts";
import { buildCrudRoutes } from "../crud-builder.ts";
import {
	validateCreateResource,
	validateUpdateResource,
	validateStatus,
	validateTransition,
} from "@procomeka/db/validation";
import { getDb } from "../../db.ts";
import * as repo from "@procomeka/db/repository";
import { getUploadConfig, contentDisposition, resolveStoredFilePath } from "../../uploads/config.ts";
import { readUploadContent, terminateUpload } from "../uploads.ts";
import { unlink } from "node:fs/promises";
import {
	parseJsonBodyOrNull,
	requireManageableResource,
	requireUploadSessionForManagedResource,
} from "./guards.ts";

const db = () => getDb().db;

// --- Upload routes (montadas en /uploads por admin/index.ts) ---

const adminUploadRoutes = new Hono<AuthEnv>();

adminUploadRoutes.get("/config", async (c) => c.json(getUploadConfig()));

adminUploadRoutes.use("/:id/*", requireRole("author"));

adminUploadRoutes.delete("/:id", requireRole("author"), async (c) => {
	const user = getCurrentUser(c);
	const { id } = c.req.param();
	const check = await requireUploadSessionForManagedResource(c, id);
	if ("response" in check) return check.response;

	await terminateUpload(id, user);
	return c.json({ id, cancelled: true });
});

adminUploadRoutes.get("/:id/content", async (c) => {
	const { id } = c.req.param();
	const check = await requireUploadSessionForManagedResource(c, id);
	if ("response" in check) return check.response;

	const body = await readUploadContent(id);
	return c.body(body, 200, {
		"Content-Type": check.data.session.mimeType ?? "application/octet-stream",
		"Content-Disposition": contentDisposition("inline", check.data.session.originalFilename),
	});
});

// --- Resource CRUD (montadas en /resources por admin/index.ts) ---

const resourceRoutes = buildCrudRoutes({
	baseRole: "author",
	list: (db, opts) => repo.listResources(db, opts as Parameters<typeof repo.listResources>[1]),
	getById: repo.getResourceById,
	create: (db, data) => repo.createResource(db, data as Parameters<typeof repo.createResource>[1]),
	update: (db, id, data) => repo.updateResource(db, id, data as Parameters<typeof repo.updateResource>[2]),
	remove: repo.deleteResource,
	validateCreate: validateCreateResource,
	validateUpdate: validateUpdateResource,
	canManage: canManageResource,
	listFilters: (user, params) => {
		const isCurator = hasMinRole(user.role, "curator");
		const isAdmin = hasMinRole(user.role, "admin");
		return {
			status: params.status,
			createdBy: isCurator ? undefined : user.id,
			visibleToUserId: isCurator && !isAdmin ? user.id : undefined,
		};
	},
	prepareCreate: async (body, user) => {
		await ensureCurrentUser(user);
		return { ...body, createdBy: user.id };
	},
	afterCreate: async (user, result, data) => {
		const r = result as { id: string; slug: string };
		await logActivity({
			userId: user.id,
			type: "resource_created",
			resourceId: r.id,
			resourceTitle: (data as { title?: string }).title ?? null,
			resourceSlug: r.slug,
			description: `Creaste el recurso «${(data as { title?: string }).title}»`,
		});
	},
	afterUpdate: async (user, id, entity, _data) => {
		const r = entity as { title?: string; slug?: string };
		await logActivity({
			userId: user.id,
			type: "resource_updated",
			resourceId: id,
			resourceTitle: r.title ?? null,
			resourceSlug: r.slug ?? null,
			description: `Actualizaste el recurso «${r.title}»`,
		});
	},
	afterDelete: async (user, id, entity) => {
		const r = entity as { title?: string; slug?: string };
		await logActivity({
			userId: user.id,
			type: "resource_deleted",
			resourceId: id,
			resourceTitle: r.title ?? null,
			resourceSlug: r.slug ?? null,
			description: `Eliminaste el recurso «${r.title}»`,
		});
	},
	notFoundMessage: "Recurso no encontrado",
});

// --- Draft creation (bypasses required-field validation) ---

resourceRoutes.post("/draft", requireRole("author"), async (c) => {
	const user = getCurrentUser(c);
	await ensureCurrentUser(user);
	const result = await repo.createResource(db(), {
		title: "Nuevo recurso",
		description: " ",
		language: "es",
		license: "cc-by",
		resourceType: "actividad-interactiva",
		editorialStatus: "draft",
		createdBy: user.id,
	});
	return c.json(result, 201);
});

// --- Sub-resource routes (custom, appended to resourceRoutes) ---

resourceRoutes.get("/:id/media", async (c) => {
	const { id } = c.req.param();
	const check = await requireManageableResource(c, id);
	if ("response" in check) return check.response;
	const items = await repo.listMediaItemsForResource(db(), id);
	// Rewrite URLs to the admin endpoint so authenticated users can download
	// files regardless of the resource's editorial status.
	const adminItems = items.map((item) => ({
		...item,
		url: item.url.replace(/^\/api\/v1\/uploads\//, "/api/admin/uploads/"),
	}));
	return c.json(adminItems);
});

resourceRoutes.delete("/:id/media/:mediaItemId", async (c) => {
	const { id, mediaItemId } = c.req.param();
	const check = await requireManageableResource(c, id);
	if ("response" in check) return check.response;

	const items = await repo.listMediaItemsForResource(db(), id);
	const item = items.find((m) => m.id === mediaItemId);
	if (!item) return c.json({ error: "Archivo no encontrado" }, 404);

	const config = getUploadConfig();
	if (item.uploadId) {
		await unlink(resolveStoredFilePath(config, item.uploadId)).catch(() => {});
		await repo.cancelUploadSession(db(), item.uploadId).catch(() => {});
	}
	await repo.deleteMediaItem(db(), mediaItemId);

	return c.json({ id: mediaItemId, deleted: true });
});

resourceRoutes.get("/:id/uploads", async (c) => {
	const { id } = c.req.param();
	const check = await requireManageableResource(c, id);
	if ("response" in check) return check.response;
	return c.json(await repo.listUploadSessionsForResource(db(), id));
});

resourceRoutes.get("/:id/elpx", async (c) => {
	const { id } = c.req.param();
	const check = await requireManageableResource(c, id);
	if ("response" in check) return check.response;

	const elpx = await repo.getElpxProjectByResourceId(db(), id);
	if (!elpx) return c.json({ error: "Este recurso no tiene un proyecto eXeLearning asociado" }, 404);

	// Find the raw .elpx download URL from the upload session or media item
	let elpxFileUrl: string | null = null;
	if (elpx.uploadSessionId) {
		elpxFileUrl = `/api/admin/uploads/${elpx.uploadSessionId}/content`;
	} else {
		// Fallback: find the media item for this resource with .elpx filename
		const mediaItems = await repo.listMediaItemsForResource(db(), id);
		const elpxMedia = mediaItems.find((m: { filename?: string | null }) =>
			m.filename?.endsWith(".elpx") || m.filename?.endsWith(".elp"));
		if (elpxMedia) elpxFileUrl = elpxMedia.url;
	}

	const metadata = elpx.elpxMetadata ? JSON.parse(elpx.elpxMetadata) : null;
	return c.json({
		id: elpx.id,
		hash: elpx.hash,
		hasPreview: elpx.hasPreview,
		previewUrl: elpx.hasPreview ? `/api/v1/elpx/${elpx.hash}/` : null,
		elpxFileUrl,
		metadata,
		originalFilename: elpx.originalFilename,
		version: elpx.version,
		createdAt: elpx.createdAt,
	});
});

resourceRoutes.patch("/:id/status", async (c) => {
	const user = getCurrentUser(c);
	const { id } = c.req.param();
	const body = await parseJsonBodyOrNull<{ status?: string }>(c);

	const validation = validateStatus(body.status);
	if (!validation.valid) return c.json({ error: "Validación fallida", details: validation.errors }, 400);

	const check = await requireManageableResource(c, id);
	if ("response" in check) return check.response;
	const existing = check.data;

	const userRole = user.role ?? "reader";
	const transitionCheck = validateTransition(existing.editorialStatus, body.status, userRole);
	if (!transitionCheck.valid) return c.json({ error: "Transición no permitida", details: transitionCheck.errors }, 403);

	await repo.updateEditorialStatus(db(), id, body.status, user.id);

	const statusLabels: Record<string, string> = {
		draft: "borrador", review: "revisión", published: "publicado", archived: "archivado",
	};
	const activityType = body.status === "published" ? "resource_published"
		: body.status === "draft" ? "resource_drafted"
		: "resource_status_changed";
	await logActivity({
		userId: user.id,
		type: activityType,
		resourceId: id,
		resourceTitle: existing.title,
		resourceSlug: existing.slug,
		description: `Cambiaste el estado de «${existing.title}» a ${statusLabels[body.status] ?? body.status}`,
		metadata: { oldStatus: existing.editorialStatus, newStatus: body.status },
	});

	return c.json({ id, status: body.status });
});

export { resourceRoutes, adminUploadRoutes };
