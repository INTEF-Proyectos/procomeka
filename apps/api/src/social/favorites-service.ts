import { and, eq, sql } from "drizzle-orm";
import { favorites } from "@procomeka/db/schema";
import { getDb } from "../db.ts";

export async function toggleResourceFavorite(input: {
	resourceId: string;
	userId: string;
}) {
	const db = getDb().db;
	const existing = await db
		.select({ id: favorites.id })
		.from(favorites)
		.where(and(eq(favorites.resourceId, input.resourceId), eq(favorites.userId, input.userId)))
		.limit(1);

	let favorited: boolean;
	if (existing[0]) {
		await db.delete(favorites).where(eq(favorites.id, existing[0].id));
		favorited = false;
	} else {
		await db.insert(favorites).values({
			id: crypto.randomUUID(),
			resourceId: input.resourceId,
			userId: input.userId,
			createdAt: new Date(),
		});
		favorited = true;
	}

	return {
		favorited,
		count: await getFavoriteCount(input.resourceId),
	};
}

export async function getFavoriteCount(resourceId: string) {
	const db = getDb().db;
	const countResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(favorites)
		.where(eq(favorites.resourceId, resourceId));

	return Number(countResult[0]?.count ?? 0);
}

export async function getUserFavoriteState(resourceId: string, userId?: string) {
	if (!userId) return false;

	const db = getDb().db;
	const favoriteRows = await db
		.select({ id: favorites.id })
		.from(favorites)
		.where(and(eq(favorites.resourceId, resourceId), eq(favorites.userId, userId)))
		.limit(1);

	return favoriteRows.length > 0;
}
