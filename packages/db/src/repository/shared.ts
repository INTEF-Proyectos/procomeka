import { sql } from "drizzle-orm";
import { collectionResources, collections } from "../schema/collections.ts";
import { resources } from "../schema/resources.ts";

export type DrizzleDB = {
	select: (...args: unknown[]) => unknown;
	insert: (...args: unknown[]) => unknown;
	update: (...args: unknown[]) => unknown;
	// biome-ignore lint: generic drizzle db type
	[key: string]: any;
};

const ACCENTED_CHARACTERS = "áéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ";
const NORMALIZED_CHARACTERS = "aeiouAEIOUaeiouAEIOUnN";

/**
 * Normaliza un string para búsqueda insensible a mayúsculas y acentos.
 * Usa translate para ser compatible con PGlite y PostgreSQL estándar sin extensiones.
 */
export function normalizeSearch(column: any) {
	return sql`lower(translate(${column}, ${ACCENTED_CHARACTERS}, ${NORMALIZED_CHARACTERS}))`;
}

export function buildSearchTerm(value: string) {
	return `%${value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}%`;
}

export function buildSlug(value: string) {
	return value
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

export function normalizeMediaUrl(url: string, uploadId?: string | null) {
	if (uploadId) return `/api/v1/uploads/${uploadId}/content`;
	return url.replace(/^\/api\/admin\/uploads\/([^/]+)\/content$/, "/api/v1/uploads/$1/content");
}

export function collectionResourceCountSql(resourceStatus?: string) {
	return sql<number>`(
		select count(*)
		from ${collectionResources}
		inner join ${resources}
			on ${collectionResources.resourceId} = ${resources.id}
		where ${collectionResources.collectionId} = ${collections.id}
			and ${resources.deletedAt} is null
			${resourceStatus ? sql`and ${resources.editorialStatus} = ${resourceStatus}` : sql``}
	)`;
}

export function normalizePagination(limit?: number, offset?: number, maxLimit = 100) {
	return {
		limit: Math.min(limit ?? 20, maxLimit),
		offset: offset ?? 0,
	};
}

export function andWhere(conditions: any[]) {
	return conditions.reduce((left, right) => sql`${left} AND ${right}`);
}
