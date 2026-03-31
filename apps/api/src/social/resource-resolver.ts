import { and, eq, isNull } from "drizzle-orm";
import { resources } from "@procomeka/db/schema";
import { getDb } from "../db.ts";

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
