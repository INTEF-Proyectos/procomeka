import { asc, eq, sql } from "drizzle-orm";
import { taxonomies } from "../schema/taxonomies.ts";
import {
	buildSearchTerm,
	buildSlug,
	type DrizzleDB,
	normalizePagination,
	normalizeSearch,
} from "./shared.ts";

export async function listTaxonomies(
	db: DrizzleDB,
	opts: { limit?: number; offset?: number; search?: string; type?: string } = {},
) {
	const { limit, offset } = normalizePagination(opts.limit, opts.offset);
	const conditions = [];

	if (opts.search) {
		const term = buildSearchTerm(opts.search);
		conditions.push(
			sql`(${normalizeSearch(taxonomies.name)} LIKE ${term} OR ${normalizeSearch(taxonomies.slug)} LIKE ${term})`,
		);
	}
	if (opts.type) conditions.push(eq(taxonomies.type, opts.type));

	const where = conditions.length
		? conditions.reduce((left, right) => sql`${left} AND ${right}`)
		: undefined;
	const query = db
		.select({
			id: taxonomies.id,
			slug: taxonomies.slug,
			name: taxonomies.name,
			type: taxonomies.type,
			parentId: taxonomies.parentId,
			createdAt: taxonomies.createdAt,
			updatedAt: taxonomies.updatedAt,
		})
		.from(taxonomies)
		.limit(limit)
		.offset(offset)
		.orderBy(asc(taxonomies.type), asc(taxonomies.name));
	const rows = where ? await query.where(where) : await query;

	const countQuery = db.select({ count: sql<number>`count(*)` }).from(taxonomies);
	const countRows = where ? await countQuery.where(where) : await countQuery;

	return { data: rows, total: countRows[0]?.count ?? 0, limit, offset };
}

export async function getTaxonomyById(db: DrizzleDB, id: string) {
	const rows = await db
		.select({
			id: taxonomies.id,
			slug: taxonomies.slug,
			name: taxonomies.name,
			type: taxonomies.type,
			parentId: taxonomies.parentId,
			createdAt: taxonomies.createdAt,
			updatedAt: taxonomies.updatedAt,
		})
		.from(taxonomies)
		.where(eq(taxonomies.id, id))
		.limit(1);

	return rows[0] ?? null;
}

export async function createTaxonomy(
	db: DrizzleDB,
	data: { name: string; slug?: string; type?: string; parentId?: string | null },
) {
	const id = crypto.randomUUID();
	const slug = `${buildSlug(data.slug ?? data.name)}-${id.slice(0, 8)}`;
	const now = new Date();

	await db.insert(taxonomies).values({
		id,
		slug,
		name: data.name,
		type: data.type ?? "category",
		parentId: data.parentId ?? null,
		createdAt: now,
		updatedAt: now,
	});

	return { id, slug };
}

export async function updateTaxonomy(
	db: DrizzleDB,
	id: string,
	data: Partial<{ name: string; slug: string; type: string; parentId: string | null }>,
) {
	await db
		.update(taxonomies)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(taxonomies.id, id));
}

export async function deleteTaxonomy(db: DrizzleDB, id: string) {
	await db.delete(taxonomies).where(eq(taxonomies.id, id));
}
