import { and, asc, desc, eq, isNull, or, sql } from "drizzle-orm";
import { ratings, favorites } from "../schema/social.ts";
import {
	mediaItems,
	resourceLevels,
	resources,
	resourceSubjects,
} from "../schema/resources.ts";
import { uploadSessions } from "../schema/uploads.ts";
import { user } from "../schema/auth.ts";
import {
	andWhere,
	buildSearchTerm,
	buildSlug,
	type DrizzleDB,
	normalizeMediaUrl,
	normalizePagination,
	normalizeSearch,
} from "./shared.ts";

type ResourceListOptions = {
	limit?: number;
	offset?: number;
	search?: string;
	status?: string;
	resourceType?: string;
	language?: string;
	license?: string;
	createdBy?: string;
	visibleToUserId?: string;
};

type ResourceMutationInput = {
	title: string;
	description: string;
	language: string;
	license: string;
	resourceType: string;
	keywords?: string;
	author?: string;
	publisher?: string;
	subjects?: string[];
	levels?: string[];
	createdBy?: string;
};

const resourceDetailSelection = {
	id: resources.id,
	slug: resources.slug,
	externalId: resources.externalId,
	sourceUri: resources.sourceUri,
	title: resources.title,
	description: resources.description,
	language: resources.language,
	license: resources.license,
	resourceType: resources.resourceType,
	keywords: resources.keywords,
	author: resources.author,
	publisher: resources.publisher,
	createdBy: resources.createdBy,
	createdByName: user.name,
	editorialStatus: resources.editorialStatus,
	assignedCuratorId: resources.assignedCuratorId,
	curatedAt: resources.curatedAt,
	deletedAt: resources.deletedAt,
	createdAt: resources.createdAt,
	updatedAt: resources.updatedAt,
};

async function getResourceTaxonomyValues(
	db: DrizzleDB,
	resourceId: string,
) {
	const [subjects, levels] = await Promise.all([
		db
			.select({ subject: resourceSubjects.subject })
			.from(resourceSubjects)
			.where(eq(resourceSubjects.resourceId, resourceId)),
		db
			.select({ level: resourceLevels.level })
			.from(resourceLevels)
			.where(eq(resourceLevels.resourceId, resourceId)),
	]);

	return {
		subjects: subjects.map((subject: { subject: string }) => subject.subject),
		levels: levels.map((level: { level: string }) => level.level),
	};
}

export async function listResources(db: DrizzleDB, opts: ResourceListOptions) {
	const { limit, offset } = normalizePagination(opts.limit, opts.offset);
	const conditions = [isNull(resources.deletedAt)];

	if (opts.search) {
		const term = buildSearchTerm(opts.search);
		conditions.push(
			sql`(${normalizeSearch(resources.title)} LIKE ${term} OR
                 ${normalizeSearch(resources.description)} LIKE ${term} OR
                 ${normalizeSearch(resources.author)} LIKE ${term} OR
                 ${normalizeSearch(resources.keywords)} LIKE ${term})`,
		);
	}
	if (opts.status) conditions.push(eq(resources.editorialStatus, opts.status));
	if (opts.resourceType) conditions.push(eq(resources.resourceType, opts.resourceType));
	if (opts.language) conditions.push(eq(resources.language, opts.language));
	if (opts.license) conditions.push(eq(resources.license, opts.license));
	if (opts.createdBy) conditions.push(eq(resources.createdBy, opts.createdBy));
	if (opts.visibleToUserId) {
		conditions.push(
			or(
				eq(resources.createdBy, opts.visibleToUserId),
				eq(resources.assignedCuratorId, opts.visibleToUserId),
			),
		);
	}

	const where = andWhere(conditions);
	const rows = await db
		.select({
			id: resources.id,
			slug: resources.slug,
			externalId: resources.externalId,
			sourceUri: resources.sourceUri,
			title: resources.title,
			description: resources.description,
			language: resources.language,
			license: resources.license,
			resourceType: resources.resourceType,
			keywords: resources.keywords,
			author: resources.author,
			publisher: resources.publisher,
			createdBy: resources.createdBy,
			createdByName: user.name,
			editorialStatus: resources.editorialStatus,
			featuredAt: resources.featuredAt,
			deletedAt: resources.deletedAt,
			createdAt: resources.createdAt,
			updatedAt: resources.updatedAt,
			favoriteCount: sql<number>`(SELECT count(*) FROM favorites WHERE favorites.resource_id = ${resources.id})`,
			ratingAvg: sql<number>`(SELECT coalesce(avg(score), 0) FROM ratings WHERE ratings.resource_id = ${resources.id})`,
			ratingCount: sql<number>`(SELECT count(*) FROM ratings WHERE ratings.resource_id = ${resources.id})`,
		})
		.from(resources)
		.leftJoin(user, eq(resources.createdBy, user.id))
		.where(where)
		.limit(limit)
		.offset(offset)
		.orderBy(desc(resources.createdAt));

	const countResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(resources)
		.where(where);

	return { data: rows, total: countResult[0]?.count ?? 0, limit, offset };
}

export async function getResourceById(db: DrizzleDB, id: string) {
	const rows = await db
		.select(resourceDetailSelection)
		.from(resources)
		.leftJoin(user, eq(resources.createdBy, user.id))
		.where(and(eq(resources.id, id), isNull(resources.deletedAt)))
		.limit(1);

	const resource = rows[0];
	if (!resource) return null;

	return {
		...resource,
		...(await getResourceTaxonomyValues(db, resource.id)),
	};
}

export async function getResourceBySlug(db: DrizzleDB, slug: string) {
	const rows = await db
		.select(resourceDetailSelection)
		.from(resources)
		.leftJoin(user, eq(resources.createdBy, user.id))
		.where(and(eq(resources.slug, slug), isNull(resources.deletedAt)))
		.limit(1);

	const resource = rows[0];
	if (!resource) return null;

	return {
		...resource,
		...(await getResourceTaxonomyValues(db, resource.id)),
		mediaItems: await listMediaItemsForResource(db, resource.id),
	};
}

export async function createResource(db: DrizzleDB, data: ResourceMutationInput) {
	const id = crypto.randomUUID();
	const slug = `${buildSlug(data.title)}-${id.slice(0, 8)}`;
	const now = new Date();

	await db.insert(resources).values({
		id,
		slug,
		title: data.title,
		description: data.description,
		language: data.language,
		license: data.license,
		resourceType: data.resourceType,
		keywords: data.keywords ?? null,
		author: data.author ?? null,
		publisher: data.publisher ?? null,
		createdBy: data.createdBy ?? null,
		editorialStatus: "draft",
		createdAt: now,
		updatedAt: now,
	});

	if (data.subjects?.length) {
		for (const subject of data.subjects) {
			await db.insert(resourceSubjects).values({ resourceId: id, subject });
		}
	}

	if (data.levels?.length) {
		for (const level of data.levels) {
			await db.insert(resourceLevels).values({ resourceId: id, level });
		}
	}

	return { id, slug };
}

export async function updateResource(
	db: DrizzleDB,
	id: string,
	data: Partial<{
		title: string;
		description: string;
		language: string;
		license: string;
		resourceType: string;
		keywords: string;
		author: string;
		publisher: string;
	}>,
) {
	await db
		.update(resources)
		.set({ ...data, updatedAt: new Date() })
		.where(and(eq(resources.id, id), isNull(resources.deletedAt)));
}

export async function deleteResource(db: DrizzleDB, id: string) {
	await db
		.update(resources)
		.set({ deletedAt: new Date(), updatedAt: new Date() })
		.where(and(eq(resources.id, id), isNull(resources.deletedAt)));
}

export async function updateEditorialStatus(
	db: DrizzleDB,
	id: string,
	status: string,
	curatorId: string,
) {
	const updates: Record<string, unknown> = {
		editorialStatus: status,
		assignedCuratorId: curatorId,
		updatedAt: new Date(),
	};
	if (status === "published" || status === "archived") {
		updates.curatedAt = new Date();
	}

	await db
		.update(resources)
		.set(updates)
		.where(and(eq(resources.id, id), isNull(resources.deletedAt)));
}

export async function listMediaItemsForResource(db: DrizzleDB, resourceId: string) {
	const rows = await db
		.select({
			id: mediaItems.id,
			resourceId: mediaItems.resourceId,
			type: mediaItems.type,
			mimeType: mediaItems.mimeType,
			url: mediaItems.url,
			fileSize: mediaItems.fileSize,
			filename: mediaItems.filename,
			isPrimary: mediaItems.isPrimary,
			uploadId: uploadSessions.id,
		})
		.from(mediaItems)
		.leftJoin(uploadSessions, eq(uploadSessions.mediaItemId, mediaItems.id))
		.where(eq(mediaItems.resourceId, resourceId))
		.orderBy(desc(mediaItems.isPrimary), asc(mediaItems.filename));

	return rows.map((row: any) => ({
		id: row.id,
		resourceId: row.resourceId,
		type: row.type,
		mimeType: row.mimeType,
		url: normalizeMediaUrl(row.url, row.uploadId),
		fileSize: row.fileSize,
		filename: row.filename,
		isPrimary: row.isPrimary,
		uploadId: row.uploadId as string | null,
	}));
}

export async function createMediaItem(
	db: DrizzleDB,
	data: {
		resourceId: string;
		type: string;
		mimeType?: string | null;
		url: string;
		fileSize?: number | null;
		filename?: string | null;
		isPrimary?: boolean;
	},
) {
	const id = crypto.randomUUID();
	await db.insert(mediaItems).values({
		id,
		resourceId: data.resourceId,
		type: data.type,
		mimeType: data.mimeType ?? null,
		url: data.url,
		fileSize: data.fileSize ?? null,
		filename: data.filename ?? null,
		isPrimary: data.isPrimary ?? false,
	});
	return { id };
}

export async function deleteMediaItem(db: DrizzleDB, id: string) {
	await db.delete(mediaItems).where(eq(mediaItems.id, id));
}
