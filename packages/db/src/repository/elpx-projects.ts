import { eq, sql } from "drizzle-orm";
import { elpxProjects } from "../schema/elpx.ts";
import type { DrizzleDB } from "./shared.ts";

export async function createElpxProject(
	db: DrizzleDB,
	data: {
		resourceId: string;
		hash: string;
		extractPath: string;
		originalFilename: string;
		uploadSessionId?: string | null;
		version?: number;
		hasPreview?: boolean;
		elpxMetadata?: string | null;
	},
) {
	const id = crypto.randomUUID();
	await db.insert(elpxProjects).values({
		id,
		resourceId: data.resourceId,
		hash: data.hash,
		extractPath: data.extractPath,
		originalFilename: data.originalFilename,
		uploadSessionId: data.uploadSessionId ?? null,
		version: data.version ?? 3,
		hasPreview: data.hasPreview ?? false,
		elpxMetadata: data.elpxMetadata ?? null,
		createdAt: new Date(),
		updatedAt: new Date(),
	});
	return { id };
}

export async function getElpxProjectByResourceId(db: DrizzleDB, resourceId: string) {
	const rows = await db
		.select()
		.from(elpxProjects)
		.where(eq(elpxProjects.resourceId, resourceId))
		.limit(1);
	return rows[0] ?? null;
}

export async function getElpxProjectByHash(db: DrizzleDB, hash: string) {
	const rows = await db
		.select()
		.from(elpxProjects)
		.where(eq(elpxProjects.hash, hash))
		.limit(1);
	return rows[0] ?? null;
}

export async function deleteElpxProject(db: DrizzleDB, id: string) {
	await db.delete(elpxProjects).where(eq(elpxProjects.id, id));
}

export async function listElpxProjectsByResourceIds(db: DrizzleDB, resourceIds: string[]) {
	if (!resourceIds.length) return [];
	return db
		.select({
			resourceId: elpxProjects.resourceId,
			hash: elpxProjects.hash,
			hasPreview: elpxProjects.hasPreview,
		})
		.from(elpxProjects)
		.where(sql`${elpxProjects.resourceId} IN (${sql.join(resourceIds.map((id) => sql`${id}`), sql`, `)})`);
}
