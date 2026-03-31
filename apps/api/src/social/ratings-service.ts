import { and, eq, sql } from "drizzle-orm";
import { ratings } from "@procomeka/db/schema";
import { getDb } from "../db.ts";
import { roundRatingAverage } from "./resource-card.ts";

export async function getResourceRatingsSummary(
	resourceId: string,
	currentUserId?: string,
) {
	const db = getDb().db;
	const rows = await db
		.select({
			score: ratings.score,
			count: sql<number>`count(*)`,
		})
		.from(ratings)
		.where(eq(ratings.resourceId, resourceId))
		.groupBy(ratings.score);

	let totalRatings = 0;
	let totalScore = 0;
	const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
	for (const row of rows) {
		const count = Number(row.count);
		distribution[row.score] = count;
		totalRatings += count;
		totalScore += row.score * count;
	}

	let userScore: number | null = null;
	if (currentUserId) {
		const userRating = await db
			.select({ score: ratings.score })
			.from(ratings)
			.where(and(eq(ratings.resourceId, resourceId), eq(ratings.userId, currentUserId)))
			.limit(1);
		userScore = userRating[0]?.score ?? null;
	}

	return {
		averageScore: totalRatings > 0 ? roundRatingAverage(totalScore / totalRatings) : 0,
		totalRatings,
		distribution,
		userScore,
	};
}

export async function upsertResourceRating(input: {
	resourceId: string;
	userId: string;
	score: number;
}) {
	const db = getDb().db;
	const now = new Date();
	const existing = await db
		.select({ id: ratings.id })
		.from(ratings)
		.where(and(eq(ratings.resourceId, input.resourceId), eq(ratings.userId, input.userId)))
		.limit(1);

	if (existing[0]) {
		await db
			.update(ratings)
			.set({ score: input.score, updatedAt: now })
			.where(eq(ratings.id, existing[0].id));
	} else {
		await db.insert(ratings).values({
			id: crypto.randomUUID(),
			resourceId: input.resourceId,
			userId: input.userId,
			score: input.score,
			createdAt: now,
			updatedAt: now,
		});
	}

	return {
		resourceId: input.resourceId,
		userId: input.userId,
		score: input.score,
		createdAt: now.toISOString(),
	};
}
