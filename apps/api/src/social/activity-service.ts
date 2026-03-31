import { desc, eq, sql } from "drizzle-orm";
import { activityEvents } from "@procomeka/db/schema";
import { getDb } from "../db.ts";

export async function listUserActivity(input: {
	userId: string;
	limit: number;
	offset: number;
}) {
	const db = getDb().db;
	const [rows, countResult] = await Promise.all([
		db
			.select({
				id: activityEvents.id,
				type: activityEvents.type,
				resourceId: activityEvents.resourceId,
				resourceTitle: activityEvents.resourceTitle,
				resourceSlug: activityEvents.resourceSlug,
				description: activityEvents.description,
				metadata: activityEvents.metadata,
				createdAt: activityEvents.createdAt,
			})
			.from(activityEvents)
			.where(eq(activityEvents.userId, input.userId))
			.orderBy(desc(activityEvents.createdAt))
			.limit(input.limit)
			.offset(input.offset),
		db
			.select({ count: sql<number>`count(*)` })
			.from(activityEvents)
			.where(eq(activityEvents.userId, input.userId)),
	]);

	return {
		data: rows.map((row) => ({
			...row,
			metadata: row.metadata ? JSON.parse(row.metadata) : null,
			createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
		})),
		total: Number(countResult[0]?.count ?? 0),
		limit: input.limit,
		offset: input.offset,
	};
}
