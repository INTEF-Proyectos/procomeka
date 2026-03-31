import { inArray, sql } from "drizzle-orm";
import * as repo from "@procomeka/db/repository";
import { favorites, ratings } from "@procomeka/db/schema";
import { getDb } from "../db.ts";
import { buildElpxMap, buildElpxPreview } from "../elpx/preview.ts";

type ResourceWithId = { id: string };

type ResourceCardSignals = {
	elpxPreview: { hash: string; previewUrl: string } | null;
	favoriteCount: number;
	rating: { average: number; count: number };
};

export type EnrichedResourceCard<T extends ResourceWithId> = T & ResourceCardSignals;

export function roundRatingAverage(value: unknown) {
	return Math.round(Number(value ?? 0) * 100) / 100;
}

export function buildResourceCard<T extends ResourceWithId>(
	row: T,
	signals: Partial<ResourceCardSignals>,
): EnrichedResourceCard<T> {
	return {
		...row,
		elpxPreview: signals.elpxPreview ?? null,
		favoriteCount: Number(signals.favoriteCount ?? 0),
		rating: {
			average: roundRatingAverage(signals.rating?.average),
			count: Number(signals.rating?.count ?? 0),
		},
	};
}

export async function enrichResourceCards<T extends ResourceWithId>(rows: T[]) {
	if (rows.length === 0) {
		return [] as Array<EnrichedResourceCard<T>>;
	}

	const db = getDb().db;
	const resourceIds = rows.map((row) => row.id);
	const [elpxList, favoriteRows, ratingRows] = await Promise.all([
		repo.listElpxProjectsByResourceIds(db, resourceIds),
		db
			.select({ resourceId: favorites.resourceId, count: sql<number>`count(*)` })
			.from(favorites)
			.where(inArray(favorites.resourceId, resourceIds))
			.groupBy(favorites.resourceId),
		db
			.select({
				resourceId: ratings.resourceId,
				avg: sql<number>`coalesce(avg(${ratings.score}), 0)`,
				count: sql<number>`count(*)`,
			})
			.from(ratings)
			.where(inArray(ratings.resourceId, resourceIds))
			.groupBy(ratings.resourceId),
	]);

	const elpxMap = buildElpxMap(elpxList);
	const favoriteMap = new Map(
		favoriteRows.map((row) => [row.resourceId, Number(row.count)]),
	);
	const ratingMap = new Map(
		ratingRows.map((row) => [
			row.resourceId,
			{ average: Number(row.avg), count: Number(row.count) },
		]),
	);

	return rows.map((row) =>
		buildResourceCard(row, {
			elpxPreview: buildElpxPreview(elpxMap.get(row.id)),
			favoriteCount: favoriteMap.get(row.id) ?? 0,
			rating: ratingMap.get(row.id) ?? { average: 0, count: 0 },
		}),
	);
}
