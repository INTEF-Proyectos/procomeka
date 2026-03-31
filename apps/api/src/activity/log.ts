import { activityEvents } from "@procomeka/db/schema";
import { getDb } from "../db.ts";

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
