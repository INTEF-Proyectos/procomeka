import * as repo from "@procomeka/db/repository";
import { getDb } from "../db.ts";
import { buildElpxMap, buildElpxPreview } from "../elpx/preview.ts";
import { buildResourceCard } from "../social/resource-card.ts";

export async function listPublishedResources(opts: {
	limit: number;
	offset: number;
	search?: string;
	resourceType?: string;
	language?: string;
	license?: string;
}) {
	const db = getDb().db;
	const result = await repo.listResources(db, {
		...opts,
		status: "published",
	});

	const resourceIds = result.data.map((resource: { id: string }) => resource.id);
	const elpxMap = buildElpxMap(await repo.listElpxProjectsByResourceIds(db, resourceIds));

	return {
		...result,
		data: result.data.map((resource: Record<string, unknown>) =>
			buildResourceCard(resource as { id: string } & Record<string, unknown>, {
				elpxPreview: buildElpxPreview(elpxMap.get(resource.id as string)),
				favoriteCount: Number(resource.favoriteCount ?? 0),
				rating: {
					average: Number(resource.ratingAvg ?? 0),
					count: Number(resource.ratingCount ?? 0),
				},
			}),
		),
	};
}

export async function listPublishedCollections(opts: {
	limit: number;
	offset: number;
	search?: string;
}) {
	const db = getDb().db;
	const result = await repo.listCollections(db, {
		...opts,
		status: "published",
		resourceStatus: "published",
	});

	const firstResourceByCollection = new Map<string, string>();
	await Promise.all(
		result.data.map(async (collection: { id: string }) => {
			try {
				const collectionResources = await repo.listCollectionResources(db, collection.id, {
					limit: 1,
					status: "published",
				});
				if (collectionResources.length > 0) {
					firstResourceByCollection.set(collection.id, collectionResources[0].resourceId);
				}
			} catch {
				// Ignore optional enrichment errors and preserve the collection listing.
			}
		}),
	);

	const firstResourceIds = [...new Set(firstResourceByCollection.values())];
	const elpxMap =
		firstResourceIds.length > 0
			? buildElpxMap(await repo.listElpxProjectsByResourceIds(db, firstResourceIds))
			: new Map();

	return {
		...result,
		data: result.data.map((collection: { id: string }) => {
			const resourceId = firstResourceByCollection.get(collection.id);
			return {
				...collection,
				elpxPreview: buildElpxPreview(resourceId ? elpxMap.get(resourceId) : null),
			};
		}),
	};
}

export async function listPublishedCollectionResources(collectionId: string) {
	const db = getDb().db;
	const resources = await repo.listCollectionResources(db, collectionId, {
		limit: 100,
		status: "published",
	});

	const resourceIds = resources
		.map((resource: { resourceId: string }) => resource.resourceId)
		.filter(Boolean);

	if (resourceIds.length === 0) {
		return resources;
	}

	const elpxMap = buildElpxMap(await repo.listElpxProjectsByResourceIds(db, resourceIds));
	return resources.map((resource: { resourceId: string }) => ({
		...resource,
		elpxPreview: buildElpxPreview(elpxMap.get(resource.resourceId)),
	}));
}
