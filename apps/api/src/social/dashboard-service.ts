import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { favorites, ratings, resources } from "@procomeka/db/schema";
import { getDb } from "../db.ts";
import { enrichResourceCards } from "./resource-card.ts";

export async function getUserDashboardSummary(userId: string) {
	const db = getDb().db;
	const [draftResult, publishedResult, favResult, ratingCountResult, recentResources] =
		await Promise.all([
			db.select({ count: sql<number>`count(*)` }).from(resources).where(
				and(
					eq(resources.createdBy, userId),
					eq(resources.editorialStatus, "draft"),
					isNull(resources.deletedAt),
				),
			),
			db.select({ count: sql<number>`count(*)` }).from(resources).where(
				and(
					eq(resources.createdBy, userId),
					eq(resources.editorialStatus, "published"),
					isNull(resources.deletedAt),
				),
			),
			db.select({ count: sql<number>`count(*)` }).from(favorites).where(eq(favorites.userId, userId)),
			db.select({ count: sql<number>`count(*)` }).from(ratings).where(eq(ratings.userId, userId)),
			db
				.select({
					id: resources.id,
					slug: resources.slug,
					title: resources.title,
					description: resources.description,
					language: resources.language,
					license: resources.license,
					resourceType: resources.resourceType,
					keywords: resources.keywords,
					author: resources.author,
					publisher: resources.publisher,
					editorialStatus: resources.editorialStatus,
					createdBy: resources.createdBy,
					createdAt: resources.createdAt,
					updatedAt: resources.updatedAt,
				})
				.from(resources)
				.where(and(eq(resources.createdBy, userId), isNull(resources.deletedAt)))
				.orderBy(desc(resources.updatedAt))
				.limit(5),
		]);

	return {
		draftCount: Number(draftResult[0]?.count ?? 0),
		publishedCount: Number(publishedResult[0]?.count ?? 0),
		favoriteCount: Number(favResult[0]?.count ?? 0),
		ratingCount: Number(ratingCountResult[0]?.count ?? 0),
		recentResources: await enrichResourceCards(recentResources),
	};
}
