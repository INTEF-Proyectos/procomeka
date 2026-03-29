import type { Context } from "hono";
import { getDb } from "./db.ts";
import * as repo from "@procomeka/db/repository";
import { activityEvents } from "@procomeka/db/schema";

export function parsePagination(c: Context) {
	const limit = Math.min(Math.max(Number(c.req.query("limit") ?? "20") || 20, 1), 100);
	const offset = Math.max(Number(c.req.query("offset") ?? "0") || 0, 0);
	const search = c.req.query("q") ?? undefined;
	return { limit, offset, search };
}

export async function ensureCurrentUser(user: { id: string; role?: string; name?: string; email?: string }) {
	await repo.ensureUser(getDb().db, {
		id: user.id,
		email: user.email ?? `${user.id}@local.invalid`,
		name: user.name ?? null,
		role: user.role ?? "reader",
	});
}

/** Build a normalised elpxPreview object from a raw elpx project row. */
export function buildElpxPreview(
	elpx: unknown,
): { hash: string; previewUrl: string } | null {
	const row = elpx as { hash?: string; hasPreview?: number } | null | undefined;
	if (!row || row.hasPreview !== 1 || !row.hash) return null;
	return { hash: row.hash, previewUrl: `/api/v1/elpx/${row.hash}/` };
}

/** Fire-and-forget activity logging. Never throws. */
export async function logActivity(opts: {
	userId: string;
	type: string;
	resourceId?: string | null;
	resourceTitle?: string | null;
	resourceSlug?: string | null;
	description: string;
	metadata?: Record<string, unknown>;
}): Promise<void> {
	try {
		const db = getDb().db;
		await db.insert(activityEvents).values({
			id: crypto.randomUUID(),
			userId: opts.userId,
			type: opts.type,
			resourceId: opts.resourceId ?? null,
			resourceTitle: opts.resourceTitle ?? null,
			resourceSlug: opts.resourceSlug ?? null,
			description: opts.description,
			metadata: opts.metadata ? JSON.stringify(opts.metadata) : null,
			createdAt: new Date(),
		});
	} catch {
		// Fire-and-forget: never let activity logging break the main action
	}
}
