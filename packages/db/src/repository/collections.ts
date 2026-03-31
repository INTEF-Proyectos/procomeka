import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { user } from "../schema/auth.ts";
import { collectionResources, collections } from "../schema/collections.ts";
import { resources } from "../schema/resources.ts";
import {
	andWhere,
	buildSearchTerm,
	buildSlug,
	collectionResourceCountSql,
	type DrizzleDB,
	normalizePagination,
	normalizeSearch,
} from "./shared.ts";

type CollectionFilters = {
	limit?: number;
	offset?: number;
	search?: string;
	curatorId?: string;
	status?: string;
	resourceStatus?: string;
};

async function getNextCollectionResourcePosition(db: DrizzleDB, collectionId: string) {
	const rows = await db
		.select({ maxPosition: sql<number>`coalesce(max(${collectionResources.position}), -1)` })
		.from(collectionResources)
		.where(eq(collectionResources.collectionId, collectionId));
	return (rows[0]?.maxPosition ?? -1) + 1;
}

export async function listCollections(db: DrizzleDB, opts: CollectionFilters = {}) {
	const { limit, offset } = normalizePagination(opts.limit, opts.offset);
	const conditions = [];

	if (opts.search) {
		const term = buildSearchTerm(opts.search);
		conditions.push(
			sql`(${normalizeSearch(collections.title)} LIKE ${term} OR ${normalizeSearch(collections.description)} LIKE ${term})`,
		);
	}
	if (opts.curatorId) conditions.push(eq(collections.curatorId, opts.curatorId));
	if (opts.status) conditions.push(eq(collections.editorialStatus, opts.status));

	const where = conditions.length ? andWhere(conditions) : undefined;
	const query = db
		.select({
			id: collections.id,
			slug: collections.slug,
			title: collections.title,
			description: collections.description,
			coverImageUrl: collections.coverImageUrl,
			editorialStatus: collections.editorialStatus,
			curatorId: collections.curatorId,
			curatorName: user.name,
			resourceCount: collectionResourceCountSql(opts.resourceStatus),
			isOrdered: collections.isOrdered,
			createdAt: collections.createdAt,
			updatedAt: collections.updatedAt,
		})
		.from(collections)
		.leftJoin(user, eq(collections.curatorId, user.id))
		.limit(limit)
		.offset(offset)
		.orderBy(desc(collections.updatedAt));
	const rows = where ? await query.where(where) : await query;

	const countQuery = db.select({ count: sql<number>`count(*)` }).from(collections);
	const countRows = where ? await countQuery.where(where) : await countQuery;

	return { data: rows, total: countRows[0]?.count ?? 0, limit, offset };
}

export async function getCollectionById(db: DrizzleDB, id: string) {
	const rows = await db
		.select({
			id: collections.id,
			slug: collections.slug,
			title: collections.title,
			description: collections.description,
			coverImageUrl: collections.coverImageUrl,
			editorialStatus: collections.editorialStatus,
			curatorId: collections.curatorId,
			curatorName: user.name,
			resourceCount: collectionResourceCountSql(),
			isOrdered: collections.isOrdered,
			createdAt: collections.createdAt,
			updatedAt: collections.updatedAt,
		})
		.from(collections)
		.leftJoin(user, eq(collections.curatorId, user.id))
		.where(eq(collections.id, id))
		.limit(1);

	return rows[0] ?? null;
}

export async function getCollectionBySlug(
	db: DrizzleDB,
	slug: string,
	opts: { status?: string; resourceStatus?: string } = {},
) {
	const conditions = [eq(collections.slug, slug)];
	if (opts.status) conditions.push(eq(collections.editorialStatus, opts.status));

	const rows = await db
		.select({
			id: collections.id,
			slug: collections.slug,
			title: collections.title,
			description: collections.description,
			coverImageUrl: collections.coverImageUrl,
			editorialStatus: collections.editorialStatus,
			curatorId: collections.curatorId,
			curatorName: user.name,
			resourceCount: collectionResourceCountSql(opts.resourceStatus),
			isOrdered: collections.isOrdered,
			createdAt: collections.createdAt,
			updatedAt: collections.updatedAt,
		})
		.from(collections)
		.leftJoin(user, eq(collections.curatorId, user.id))
		.where(andWhere(conditions))
		.limit(1);

	return rows[0] ?? null;
}

export async function createCollection(
	db: DrizzleDB,
	data: {
		title: string;
		description: string;
		coverImageUrl?: string | null;
		curatorId: string;
		editorialStatus?: string;
		isOrdered?: boolean;
	},
) {
	const id = crypto.randomUUID();
	const slug = `${buildSlug(data.title)}-${id.slice(0, 8)}`;
	const now = new Date();

	await db.insert(collections).values({
		id,
		slug,
		title: data.title,
		description: data.description,
		coverImageUrl: data.coverImageUrl ?? null,
		curatorId: data.curatorId,
		editorialStatus: data.editorialStatus ?? "draft",
		isOrdered: data.isOrdered ?? false,
		createdAt: now,
		updatedAt: now,
	});

	return { id, slug };
}

export async function updateCollection(
	db: DrizzleDB,
	id: string,
	data: Partial<{
		title: string;
		description: string;
		coverImageUrl: string | null;
		editorialStatus: string;
		isOrdered: boolean;
	}>,
) {
	await db
		.update(collections)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(collections.id, id));
}

export async function deleteCollection(db: DrizzleDB, id: string) {
	await db.delete(collections).where(eq(collections.id, id));
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
