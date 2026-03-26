import { Hono } from "hono";
import {
	type AuthEnv,
	requireAuth,
	requireRole,
} from "../auth/middleware.ts";
import {
	createResource,
	updateResource,
	deleteResource,
	updateEditorialStatus,
	listResources,
	getResourceById,
} from "../resources/repository.ts";
import { getDb } from "../db.ts";
import * as repo from "@procomeka/db/repository";
import {
	validateCreateResource,
	validateUpdateResource,
	validateStatus,
	validateTransition,
} from "../resources/validation.ts";

const adminRoutes = new Hono<AuthEnv>();

adminRoutes.use("*", requireAuth);

adminRoutes.get("/resources", requireRole("author"), async (c) => {
	const limit = Number(c.req.query("limit") ?? "20");
	const offset = Number(c.req.query("offset") ?? "0");
	const search = c.req.query("q") ?? undefined;
	const status = c.req.query("status") ?? undefined;

	const user = c.get("user") as { id: string; role?: string };
	const role = user.role ?? "reader";

	// Authors and curators only see their own or assigned if not admin?
	// The requirement says:
	// Admin: All
	// Editor (Curator): Assigned + own
	// Author: Only own
	const createdBy = role === "admin" || role === "curator" ? undefined : user.id;

	const result = await listResources({ limit, offset, search, status, createdBy });
	return c.json(result);
});

adminRoutes.get("/resources/:id", requireRole("author"), async (c) => {
	const { id } = c.req.param();
	const resource = await getResourceById(id);
	if (!resource) {
		return c.json({ error: "Recurso no encontrado" }, 404);
	}
	return c.json(resource);
});

adminRoutes.post("/resources", requireRole("author"), async (c) => {
	const body = await c.req.json();
	const validation = validateCreateResource(body);

	if (!validation.valid) {
		return c.json({ error: "Validación fallida", details: validation.errors }, 400);
	}

	const user = c.get("user") as { id: string };
	const result = await createResource({ ...body, createdBy: user.id });
	return c.json(result, 201);
});

adminRoutes.patch("/resources/:id", requireRole("author"), async (c) => {
	const { id } = c.req.param();
	const existing = await getResourceById(id);
	if (!existing) {
		return c.json({ error: "Recurso no encontrado" }, 404);
	}

	const body = await c.req.json();
	const validation = validateUpdateResource(body);

	if (!validation.valid) {
		return c.json({ error: "Validación fallida", details: validation.errors }, 400);
	}

	await updateResource(id, body);
	return c.json({ id, updated: true });
});

adminRoutes.delete("/resources/:id", requireRole("admin"), async (c) => {
	const { id } = c.req.param();
	await deleteResource(id);
	return c.json({ id, deleted: true });
});

adminRoutes.patch("/resources/:id/status", requireRole("author"), async (c) => {
	const { id } = c.req.param();
	const body = await c.req.json();

	const validation = validateStatus(body.status);
	if (!validation.valid) {
		return c.json({ error: "Validación fallida", details: validation.errors }, 400);
	}

	const existing = await getResourceById(id);
	if (!existing) {
		return c.json({ error: "Recurso no encontrado" }, 404);
	}

	const user = c.get("user") as { id: string; role?: string };
	const userRole = user.role ?? "reader";
	const transitionCheck = validateTransition(existing.editorialStatus, body.status, userRole);
	if (!transitionCheck.valid) {
		return c.json({ error: "Transición no permitida", details: transitionCheck.errors }, 403);
	}

	await updateEditorialStatus(id, body.status, user.id);
	return c.json({ id, status: body.status });
});

adminRoutes.get("/users", requireRole("admin"), async (c) => {
	const limit = Number(c.req.query("limit") ?? "20");
	const offset = Number(c.req.query("offset") ?? "0");
	const search = c.req.query("q") ?? undefined;
	const result = await repo.listUsers(getDb().db, { limit, offset, search });
	return c.json(result);
});

adminRoutes.patch("/users/:id", requireRole("admin"), async (c) => {
	const { id } = c.req.param();
	const body = await c.req.json();
	if (!body.role) return c.json({ error: "Rol requerido" }, 400);
	await repo.updateUserRole(getDb().db, id, body.role);
	return c.json({ id, updated: true });
});

// --- Collections ---

adminRoutes.get("/collections", requireRole("author"), async (c) => {
	const limit = Number(c.req.query("limit") ?? "20");
	const offset = Number(c.req.query("offset") ?? "0");
	const user = c.get("user") as { id: string; role?: string };
	const role = user.role ?? "reader";
	const curatorId = role === "admin" ? undefined : user.id;

	const result = await repo.listCollections(getDb().db, { limit, offset, curatorId });
	return c.json(result);
});

adminRoutes.get("/collections/:id", requireRole("author"), async (c) => {
	const { id } = c.req.param();
	const result = await repo.getCollectionById(getDb().db, id);
	if (!result) return c.json({ error: "Colección no encontrada" }, 404);
	return c.json(result);
});

adminRoutes.post("/collections", requireRole("author"), async (c) => {
	const body = await c.req.json();
	const user = c.get("user") as { id: string };
	const result = await repo.createCollection(getDb().db, { ...body, curatorId: user.id });
	return c.json(result, 201);
});

adminRoutes.patch("/collections/:id", requireRole("author"), async (c) => {
	const { id } = c.req.param();
	const body = await c.req.json();
	await repo.updateCollection(getDb().db, id, body);
	return c.json({ id, updated: true });
});

adminRoutes.delete("/collections/:id", requireRole("author"), async (c) => {
	const { id } = c.req.param();
	await repo.deleteCollection(getDb().db, id);
	return c.json({ id, deleted: true });
});

// --- Taxonomies ---

adminRoutes.get("/taxonomies", requireRole("curator"), async (c) => {
	const type = c.req.query("type");
	const result = await repo.listTaxonomies(getDb().db, { type });
	return c.json(result);
});

adminRoutes.post("/taxonomies", requireRole("admin"), async (c) => {
	const body = await c.req.json();
	const result = await repo.createTaxonomy(getDb().db, body);
	return c.json(result, 201);
});

adminRoutes.patch("/taxonomies/:id", requireRole("admin"), async (c) => {
	const { id } = c.req.param();
	const body = await c.req.json();
	await repo.updateTaxonomy(getDb().db, id, body);
	return c.json({ id, updated: true });
});

adminRoutes.delete("/taxonomies/:id", requireRole("admin"), async (c) => {
	const { id } = c.req.param();
	await repo.deleteTaxonomy(getDb().db, id);
	return c.json({ id, deleted: true });
});

export { adminRoutes };
