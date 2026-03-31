import { asc, eq, sql } from "drizzle-orm";
import { user } from "../schema/auth.ts";
import {
	buildSearchTerm,
	type DrizzleDB,
	normalizePagination,
	normalizeSearch,
} from "./shared.ts";

export async function listUsers(
	db: DrizzleDB,
	opts: { limit?: number; offset?: number; search?: string; role?: string; id?: string } = {},
) {
	const { limit, offset } = normalizePagination(opts.limit, opts.offset);
	const conditions = [];

	if (opts.search) {
		const term = buildSearchTerm(opts.search);
		conditions.push(
			sql`(${normalizeSearch(user.name)} LIKE ${term} OR ${normalizeSearch(user.email)} LIKE ${term})`,
		);
	}
	if (opts.role) conditions.push(eq(user.role, opts.role));
	if (opts.id) conditions.push(eq(user.id, opts.id));

	const where = conditions.length
		? conditions.reduce((left, right) => sql`${left} AND ${right}`)
		: undefined;

	const query = db
		.select({
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
			isActive: user.isActive,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		})
		.from(user)
		.limit(limit)
		.offset(offset)
		.orderBy(asc(user.name), asc(user.email));
	const rows = where ? await query.where(where) : await query;

	const countQuery = db.select({ count: sql<number>`count(*)` }).from(user);
	const countRows = where ? await countQuery.where(where) : await countQuery;

	return { data: rows, total: countRows[0]?.count ?? 0, limit, offset };
}

export async function getUserById(db: DrizzleDB, id: string) {
	const rows = await db
		.select({
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
			isActive: user.isActive,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		})
		.from(user)
		.where(eq(user.id, id))
		.limit(1);

	return rows[0] ?? null;
}

export async function ensureUser(
	db: DrizzleDB,
	data: { id: string; email: string; name?: string | null; role?: string },
) {
	await db
		.insert(user)
		.values({
			id: data.id,
			email: data.email,
			name: data.name ?? null,
			role: data.role ?? "author",
			emailVerified: true,
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.onConflictDoNothing();

	return getUserById(db, data.id);
}

export async function updateUser(
	db: DrizzleDB,
	id: string,
	data: Partial<{ name: string | null; role: string; isActive: boolean }>,
) {
	await db
		.update(user)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(user.id, id));
}
