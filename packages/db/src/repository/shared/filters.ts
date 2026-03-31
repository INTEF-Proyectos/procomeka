import { sql } from "drizzle-orm";

const ACCENTED_CHARACTERS = "áéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ";
const NORMALIZED_CHARACTERS = "aeiouAEIOUaeiouAEIOUnN";

export function normalizeSearch(column: any) {
	return sql`lower(translate(${column}, ${ACCENTED_CHARACTERS}, ${NORMALIZED_CHARACTERS}))`;
}

export function buildSearchTerm(value: string) {
	return `%${value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}%`;
}

export function normalizePagination(limit?: number, offset?: number, maxLimit = 100) {
	return {
		limit: Math.min(limit ?? 20, maxLimit),
		offset: offset ?? 0,
	};
}

export function optionalAndWhere<T>(conditions: T[]) {
	if (conditions.length === 0) return undefined;
	return conditions.reduce((left, right) => sql`${left} AND ${right}`);
}
