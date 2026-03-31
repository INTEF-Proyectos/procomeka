import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { user } from "../schema/auth.ts";
import { collectionResources } from "../schema/collections.ts";
import { resources } from "../schema/resources.ts";
import {
	andWhere,
	type DrizzleDB,
	normalizePagination,
} from "./shared.ts";

async function getNextCollectionResourcePosition(db: DrizzleDB, collectionId: string) {
	const rows = await db
		.select({ maxPosition: sql<number>`coalesce(max(${collectionResources.position}), -1)` })
		.from(collectionResources)
		.where(eq(collectionResources.collectionId, collectionId));
	return (rows[0]?.maxPosition ?? -1) + 1;
}

export async function addResourceToCollection(
	db: DrizzleDB,
	collectionId: string,
	resourceId: string,
	position?: number,
) {
	const nextPosition =
		position === undefined
			? await getNextCollectionResourcePosition(db, collectionId)
			: position;

	await db
		.insert(collectionResources)
		.values({
			collectionId,
			resourceId,
			position: nextPosition,
		})
		.onConflictDoNothing();
}

export async function removeResourceFromCollection(
	db: DrizzleDB,
	collectionId: string,
	resourceId: string,
) {
	await db
		.delete(collectionResources)
		.where(
			and(
				eq(collectionResources.collectionId, collectionId),
				eq(collectionResources.resourceId, resourceId),
			),
		);
}

export async function listCollectionResources(
	db: DrizzleDB,
	collectionId: string,
	opts: { limit?: number; offset?: number; status?: string } = {},
) {
	const { limit, offset } = normalizePagination(opts.limit ?? 100, opts.offset, 100);
	const conditions = [
		eq(collectionResources.collectionId, collectionId),
		isNull(resources.deletedAt),
	];

	if (opts.status) conditions.push(eq(resources.editorialStatus, opts.status));

	return db
		.select({
			resourceId: collectionResources.resourceId,
			position: collectionResources.position,
			title: resources.title,
			slug: resources.slug,
			description: resources.description,
			resourceType: resources.resourceType,
			language: resources.language,
			license: resources.license,
			author: resources.author,
			createdByName: user.name,
			editorialStatus: resources.editorialStatus,
		})
		.from(collectionResources)
		.innerJoin(resources, eq(collectionResources.resourceId, resources.id))
		.leftJoin(user, eq(resources.createdBy, user.id))
		.where(andWhere(conditions))
		.orderBy(asc(collectionResources.position))
		.limit(limit)
		.offset(offset);
}

export async function reorderCollectionResource(
	db: DrizzleDB,
	collectionId: string,
	resourceId: string,
	direction: "up" | "down",
) {
	const items = await listCollectionResources(db, collectionId, { limit: 100 });
	const currentIndex = items.findIndex((item) => item.resourceId === resourceId);
	if (currentIndex === -1) return false;

	const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
	if (swapIndex < 0 || swapIndex >= items.length) return false;

	const current = items[currentIndex];
	const swap = items[swapIndex];

	await db
		.update(collectionResources)
		.set({ position: swap.position })
		.where(
			and(
				eq(collectionResources.collectionId, collectionId),
				eq(collectionResources.resourceId, current.resourceId),
			),
		);

	await db
		.update(collectionResources)
		.set({ position: current.position })
		.where(
			and(
				eq(collectionResources.collectionId, collectionId),
				eq(collectionResources.resourceId, swap.resourceId),
			),
		);

	return true;
}
