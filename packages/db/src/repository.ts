/**
 * Funciones de repositorio reutilizables.
 * Aceptan una instancia Drizzle como parámetro para funcionar
 * tanto en el servidor (API) como en el navegador (preview).
 */
import { eq, like, sql, desc, isNull, and, or } from "drizzle-orm";
import {
	resources,
	resourceSubjects,
	resourceLevels,
} from "./schema/resources.ts";
import { user } from "./schema/auth.ts";
import { collections, collectionResources } from "./schema/collections.ts";
import { taxonomies } from "./schema/taxonomies.ts";

type DrizzleDB = {
	select: (...args: unknown[]) => unknown;
	insert: (...args: unknown[]) => unknown;
	update: (...args: unknown[]) => unknown;
	// biome-ignore lint: generic drizzle db type
	[key: string]: any;
};

/**
 * Normaliza un string para búsqueda insensible a mayúsculas y acentos.
 * Usa translate para ser compatible con PGlite y PostgreSQL estándar sin extensiones.
 */
function normalizeSearch(col: any) {
	return sql`lower(translate(${col}, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ', 'aeiouAEIOUaeiouAEIOUnN'))`;
}

export async function listResources(
	db: DrizzleDB,
	opts: {
		limit?: number;
		offset?: number;
		search?: string;
		status?: string;
		resourceType?: string;
		language?: string;
		license?: string;
		createdBy?: string;
	},
) {
	const limit = Math.min(opts.limit ?? 20, 100);
	const offset = opts.offset ?? 0;

	const conditions = [isNull(resources.deletedAt)];
	if (opts.search) {
		const term = `%${opts.search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}%`;
		conditions.push(
			sql`(${normalizeSearch(resources.title)} LIKE ${term} OR
                 ${normalizeSearch(resources.description)} LIKE ${term} OR
                 ${normalizeSearch(resources.author)} LIKE ${term} OR
                 ${normalizeSearch(resources.keywords)} LIKE ${term})`,
		);
	}
	if (opts.status) {
		conditions.push(eq(resources.editorialStatus, opts.status));
	}
	if (opts.resourceType) {
		conditions.push(eq(resources.resourceType, opts.resourceType));
	}
	if (opts.language) {
		conditions.push(eq(resources.language, opts.language));
	}
	if (opts.license) {
		conditions.push(eq(resources.license, opts.license));
	}
	if (opts.createdBy) {
		conditions.push(eq(resources.createdBy, opts.createdBy));
	}

	const where = conditions.reduce((a, b) => sql`${a} AND ${b}`);

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
			deletedAt: resources.deletedAt,
			createdAt: resources.createdAt,
			updatedAt: resources.updatedAt,
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

	const total = countResult[0]?.count ?? 0;

	return { data: rows, total, limit, offset };
}

export async function getResourceById(db: DrizzleDB, id: string) {
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
			assignedCuratorId: resources.assignedCuratorId,
			curatedAt: resources.curatedAt,
			deletedAt: resources.deletedAt,
			createdAt: resources.createdAt,
			updatedAt: resources.updatedAt,
		})
		.from(resources)
		.leftJoin(user, eq(resources.createdBy, user.id))
		.where(and(eq(resources.id, id), isNull(resources.deletedAt)))
		.limit(1);

	const resource = rows[0];
	if (!resource) return null;

	const subjects = await db
		.select({ subject: resourceSubjects.subject })
		.from(resourceSubjects)
		.where(eq(resourceSubjects.resourceId, resource.id));

	const levels = await db
		.select({ level: resourceLevels.level })
		.from(resourceLevels)
		.where(eq(resourceLevels.resourceId, resource.id));

	return {
		...resource,
		subjects: subjects.map((s: { subject: string }) => s.subject),
		levels: levels.map((l: { level: string }) => l.level),
	};
}

export async function getResourceBySlug(db: DrizzleDB, slug: string) {
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
			assignedCuratorId: resources.assignedCuratorId,
			curatedAt: resources.curatedAt,
			deletedAt: resources.deletedAt,
			createdAt: resources.createdAt,
			updatedAt: resources.updatedAt,
		})
		.from(resources)
		.leftJoin(user, eq(resources.createdBy, user.id))
		.where(and(eq(resources.slug, slug), isNull(resources.deletedAt)))
		.limit(1);

	const resource = rows[0];
	if (!resource) return null;

	const subjects = await db
		.select({ subject: resourceSubjects.subject })
		.from(resourceSubjects)
		.where(eq(resourceSubjects.resourceId, resource.id));

	const levels = await db
		.select({ level: resourceLevels.level })
		.from(resourceLevels)
		.where(eq(resourceLevels.resourceId, resource.id));

	return {
		...resource,
		subjects: subjects.map((s: { subject: string }) => s.subject),
		levels: levels.map((l: { level: string }) => l.level),
	};
}

export async function createResource(
	db: DrizzleDB,
	data: {
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
	},
) {
	const id = crypto.randomUUID();
	const baseSlug = data.title
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
	const slug = `${baseSlug}-${id.slice(0, 8)}`;
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
			await db
				.insert(resourceSubjects)
				.values({ resourceId: id, subject });
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

// --- Users ---

export async function listUsers(
	db: DrizzleDB,
	opts: { limit?: number; offset?: number; search?: string },
) {
	const limit = Math.min(opts.limit ?? 20, 100);
	const offset = opts.offset ?? 0;

	const conditions = [];
	if (opts.search) {
		conditions.push(
			or(like(user.email, `%${opts.search}%`), like(user.name, `%${opts.search}%`)),
		);
	}

	const where = conditions.length > 0 ? conditions.reduce((a, b) => sql`${a} AND ${b}`) : undefined;

	const rows = await db
		.select()
		.from(user)
		.where(where)
		.limit(limit)
		.offset(offset)
		.orderBy(desc(user.createdAt));

	const countResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(user)
		.where(where);

	return { data: rows, total: countResult[0]?.count ?? 0, limit, offset };
}

export async function updateUserRole(db: DrizzleDB, id: string, role: string) {
	await db.update(user).set({ role, updatedAt: new Date() }).where(eq(user.id, id));
}

// --- Collections ---

export async function listCollections(
	db: DrizzleDB,
	opts: { limit?: number; offset?: number; curatorId?: string },
) {
	const limit = Math.min(opts.limit ?? 20, 100);
	const offset = opts.offset ?? 0;

	const conditions = [];
	if (opts.curatorId) {
		conditions.push(eq(collections.curatorId, opts.curatorId));
	}

	const where = conditions.length > 0 ? conditions.reduce((a, b) => sql`${a} AND ${b}`) : undefined;

	const rows = await db
		.select()
		.from(collections)
		.where(where)
		.limit(limit)
		.offset(offset)
		.orderBy(desc(collections.createdAt));

	const countResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(collections)
		.where(where);

	return { data: rows, total: countResult[0]?.count ?? 0, limit, offset };
}

export async function getCollectionById(db: DrizzleDB, id: string) {
	const rows = await db.select().from(collections).where(eq(collections.id, id)).limit(1);
	const collection = rows[0];
	if (!collection) return null;

	const resourcesInCollection = await db
		.select({
			resourceId: collectionResources.resourceId,
			position: collectionResources.position,
			title: resources.title,
			slug: resources.slug,
		})
		.from(collectionResources)
		.leftJoin(resources, eq(collectionResources.resourceId, resources.id))
		.where(eq(collectionResources.collectionId, id))
		.orderBy(collectionResources.position);

	return { ...collection, resources: resourcesInCollection };
}

export async function createCollection(
	db: DrizzleDB,
	data: {
		title: string;
		description: string;
		curatorId: string;
		isOrdered?: boolean;
		coverImageUrl?: string;
	},
) {
	const id = crypto.randomUUID();
	const slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${id.slice(0, 8)}`;
	const now = new Date();

	await db.insert(collections).values({
		id,
		slug,
		title: data.title,
		description: data.description,
		curatorId: data.curatorId,
		isOrdered: data.isOrdered ? 1 : 0,
		coverImageUrl: data.coverImageUrl,
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
		isOrdered: boolean;
		coverImageUrl: string;
		editorialStatus: string;
	}>,
) {
	const updates: any = { ...data, updatedAt: new Date() };
	if (data.isOrdered !== undefined) updates.isOrdered = data.isOrdered ? 1 : 0;

	await db.update(collections).set(updates).where(eq(collections.id, id));
}

export async function deleteCollection(db: DrizzleDB, id: string) {
	await db.delete(collections).where(eq(collections.id, id));
}

// --- Taxonomies ---

export async function listTaxonomies(db: DrizzleDB, opts: { type?: string }) {
	const conditions = [];
	if (opts.type) {
		conditions.push(eq(taxonomies.type, opts.type));
	}

	const where = conditions.length > 0 ? conditions.reduce((a, b) => sql`${a} AND ${b}`) : undefined;

	return db.select().from(taxonomies).where(where).orderBy(taxonomies.name);
}

export async function createTaxonomy(
	db: DrizzleDB,
	data: { name: string; type: string; description?: string; parentId?: string },
) {
	const id = crypto.randomUUID();
	const slug = `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${id.slice(0, 8)}`;
	const now = new Date();

	await db.insert(taxonomies).values({
		id,
		slug,
		name: data.name,
		type: data.type,
		description: data.description,
		parentId: data.parentId,
		createdAt: now,
		updatedAt: now,
	});

	return { id, slug };
}

export async function updateTaxonomy(
	db: DrizzleDB,
	id: string,
	data: Partial<{ name: string; description: string; parentId: string }>,
) {
	await db
		.update(taxonomies)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(taxonomies.id, id));
}

export async function deleteTaxonomy(db: DrizzleDB, id: string) {
	await db.delete(taxonomies).where(eq(taxonomies.id, id));
}
