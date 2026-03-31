import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import * as repo from "@procomeka/db/repository";
import {
	favorites,
	ratings,
	resources,
} from "@procomeka/db/schema";
import { getDb } from "../db.ts";
import { buildElpxMap, buildElpxPreview } from "../elpx/preview.ts";

type ResourceWithId = { id: string };

export async function enrichResources<T extends ResourceWithId>(rows: T[]) {
	if (rows.length === 0) {
		return [] as Array<
			T & {
				elpxPreview: { hash: string; previewUrl: string } | null;
				favoriteCount: number;
				rating: { average: number; count: number };
			}
		>;
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

	return rows.map((row) => {
		const rating = ratingMap.get(row.id);
		return {
			...row,
			elpxPreview: buildElpxPreview(elpxMap.get(row.id)),
			favoriteCount: favoriteMap.get(row.id) ?? 0,
			rating: {
				average: Math.round((rating?.average ?? 0) * 100) / 100,
				count: rating?.count ?? 0,
			},
		};
	});
}

export async function resolveResourceBySlug(slug: string) {
	const db = getDb().db;
	const rows = await db
		.select({
			id: resources.id,
			title: resources.title,
			slug: resources.slug,
			editorialStatus: resources.editorialStatus,
		})
		.from(resources)
		.where(and(eq(resources.slug, slug), isNull(resources.deletedAt)))
		.limit(1);
	return rows[0] ?? null;
}
