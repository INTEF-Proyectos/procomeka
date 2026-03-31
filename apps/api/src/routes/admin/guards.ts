import * as repo from "@procomeka/db/repository";
import type { Context } from "hono";
import type { AuthEnv } from "../../auth/middleware.ts";
import { canManageCollection, canManageResource, getCurrentUser } from "../../auth/roles.ts";
import { getDb } from "../../db.ts";

type GuardFailure = { response: Response };
type GuardSuccess<T> = { data: T };

export async function parseJsonBodyOrNull<T>(c: Context<AuthEnv>) {
	return (await c.req.json().catch(() => null)) as T | null;
}

export async function requireManageableResource(
	c: Context<AuthEnv>,
	resourceId: string,
): Promise<GuardFailure | GuardSuccess<Awaited<ReturnType<typeof repo.getResourceById>>>> {
	const user = getCurrentUser(c);
	const resource = await repo.getResourceById(getDb().db, resourceId);
	if (!resource) {
		return { response: c.json({ error: "Recurso no encontrado" }, 404) };
	}
	if (!canManageResource(user, resource)) {
		return { response: c.json({ error: "Permisos insuficientes" }, 403) };
	}
	return { data: resource };
}

export async function requireManageableCollection(
	c: Context<AuthEnv>,
	collectionId: string,
): Promise<GuardFailure | GuardSuccess<Awaited<ReturnType<typeof repo.getCollectionById>>>> {
	const user = getCurrentUser(c);
	const collection = await repo.getCollectionById(getDb().db, collectionId);
	if (!collection) {
		return { response: c.json({ error: "Colección no encontrada" }, 404) };
	}
	if (!canManageCollection(user, collection)) {
		return { response: c.json({ error: "Permisos insuficientes" }, 403) };
	}
	return { data: collection };
}

export async function requireUploadSessionForManagedResource(
	c: Context<AuthEnv>,
	uploadId: string,
) {
	const session = await repo.getUploadSessionById(getDb().db, uploadId);
	if (!session) {
		return { response: c.json({ error: "Upload no encontrado" }, 404) };
	}

	const resourceCheck = await requireManageableResource(c, session.resourceId);
	if ("response" in resourceCheck) {
		return resourceCheck;
	}

	return { data: { session, resource: resourceCheck.data } };
}
