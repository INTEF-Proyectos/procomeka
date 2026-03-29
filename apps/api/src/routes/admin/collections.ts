import { buildCrudRoutes } from "../crud-builder.ts";
import { validateCollection } from "@procomeka/db/validation";
import { canManageCollection, getCurrentUser, hasMinRole } from "../../auth/roles.ts";
import { ensureCurrentUser } from "../../helpers.ts";
import { getDb } from "../../db.ts";
import * as repo from "@procomeka/db/repository";

const collectionRoutes = buildCrudRoutes({
	baseRole: "curator",
	list: (db, opts) => repo.listCollections(db, opts as Parameters<typeof repo.listCollections>[1]),
	getById: repo.getCollectionById,
	create: (db, data) => repo.createCollection(db, data as Parameters<typeof repo.createCollection>[1]),
	update: (db, id, data) => {
		const payload = data as Record<string, unknown>;
		return repo.updateCollection(db, id, {
			title: typeof payload.title === "string" ? payload.title : undefined,
			description: typeof payload.description === "string" ? payload.description : undefined,
			coverImageUrl: typeof payload.coverImageUrl === "string"
				? payload.coverImageUrl
				: payload.coverImageUrl === null
				? null
				: undefined,
			editorialStatus: typeof payload.editorialStatus === "string" ? payload.editorialStatus : undefined,
			isOrdered: typeof payload.isOrdered === "boolean" ? (payload.isOrdered ? 1 : 0) : undefined,
		});
	},
	remove: repo.deleteCollection,
	validateCreate: validateCollection,
	validateUpdate: validateCollection,
	mergeOnUpdate: true,
	canManage: canManageCollection,
	listFilters: (user) => ({
		curatorId: hasMinRole(user.role, "admin") ? undefined : user.id,
	}),
	prepareCreate: async (body, user) => {
		await ensureCurrentUser(user);
		return {
			title: body.title,
			description: body.description,
			coverImageUrl: typeof body.coverImageUrl === "string" ? body.coverImageUrl : null,
			curatorId: user.id,
			editorialStatus: typeof body.editorialStatus === "string" ? body.editorialStatus : undefined,
			isOrdered: body.isOrdered ? 1 : 0,
		};
	},
	notFoundMessage: "Colección no encontrada",
});

collectionRoutes.get("/:id/resources", async (c) => {
	const currentUser = getCurrentUser(c);
	const { id } = c.req.param();
	const collection = await repo.getCollectionById(getDb().db, id);
	if (!collection) return c.json({ error: "Colección no encontrada" }, 404);
	if (!canManageCollection(currentUser, collection)) {
		return c.json({ error: "Permisos insuficientes" }, 403);
	}

	const resources = await repo.listCollectionResources(getDb().db, id, { limit: 100 });
	return c.json(resources);
});

collectionRoutes.post("/:id/resources", async (c) => {
	const currentUser = getCurrentUser(c);
	const { id } = c.req.param();
	const collection = await repo.getCollectionById(getDb().db, id);
	if (!collection) return c.json({ error: "Colección no encontrada" }, 404);
	if (!canManageCollection(currentUser, collection)) {
		return c.json({ error: "Permisos insuficientes" }, 403);
	}

	const body = await c.req.json().catch(() => null) as { resourceId?: string } | null;
	if (!body?.resourceId) {
		return c.json({ error: "resourceId es obligatorio" }, 400);
	}

	const resource = await repo.getResourceById(getDb().db, body.resourceId);
	if (!resource) {
		return c.json({ error: "Recurso no encontrado" }, 404);
	}

	await repo.addResourceToCollection(getDb().db, id, body.resourceId);
	return c.json({ ok: true }, 201);
});

collectionRoutes.delete("/:id/resources/:resourceId", async (c) => {
	const currentUser = getCurrentUser(c);
	const { id, resourceId } = c.req.param();
	const collection = await repo.getCollectionById(getDb().db, id);
	if (!collection) return c.json({ error: "Colección no encontrada" }, 404);
	if (!canManageCollection(currentUser, collection)) {
		return c.json({ error: "Permisos insuficientes" }, 403);
	}

	await repo.removeResourceFromCollection(getDb().db, id, resourceId);
	return c.json({ ok: true });
});

collectionRoutes.patch("/:id/resources/reorder", async (c) => {
	const currentUser = getCurrentUser(c);
	const { id } = c.req.param();
	const collection = await repo.getCollectionById(getDb().db, id);
	if (!collection) return c.json({ error: "Colección no encontrada" }, 404);
	if (!canManageCollection(currentUser, collection)) {
		return c.json({ error: "Permisos insuficientes" }, 403);
	}

	const body = await c.req.json().catch(() => null) as { resourceId?: string; direction?: "up" | "down" } | null;
	if (!body?.resourceId || !body.direction || !["up", "down"].includes(body.direction)) {
		return c.json({ error: "resourceId y direction válidos son obligatorios" }, 400);
	}

	const reordered = await repo.reorderCollectionResource(getDb().db, id, body.resourceId, body.direction);
	if (!reordered) {
		return c.json({ error: "No se pudo reordenar el recurso" }, 400);
	}

	return c.json({ ok: true });
});

export { collectionRoutes };
