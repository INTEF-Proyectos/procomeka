import { and, asc, desc, eq, notInArray } from "drizzle-orm";
import { uploadSessions } from "../schema/uploads.ts";
import type { DrizzleDB } from "./shared.ts";

export async function createUploadSession(
	db: DrizzleDB,
	data: {
		id: string;
		resourceId: string;
		ownerId: string;
		originalFilename: string;
		mimeType?: string | null;
		storageKey: string;
		checksumAlgorithm?: string | null;
		finalChecksum?: string | null;
		declaredSize?: number | null;
		expiresAt?: Date | null;
	},
) {
	await db.insert(uploadSessions).values({
		id: data.id,
		resourceId: data.resourceId,
		ownerId: data.ownerId,
		originalFilename: data.originalFilename,
		storageKey: data.storageKey,
		status: "created",
		receivedBytes: 0,
		createdAt: new Date(),
		updatedAt: new Date(),
		...(data.mimeType ? { mimeType: data.mimeType } : {}),
		...(data.checksumAlgorithm ? { checksumAlgorithm: data.checksumAlgorithm } : {}),
		...(data.finalChecksum ? { finalChecksum: data.finalChecksum } : {}),
		...(data.declaredSize != null ? { declaredSize: data.declaredSize } : {}),
		...(data.expiresAt ? { expiresAt: data.expiresAt } : {}),
	});
}

export async function getUploadSessionById(db: DrizzleDB, id: string) {
	const rows = await db
		.select({
			id: uploadSessions.id,
			resourceId: uploadSessions.resourceId,
			ownerId: uploadSessions.ownerId,
			mediaItemId: uploadSessions.mediaItemId,
			status: uploadSessions.status,
			originalFilename: uploadSessions.originalFilename,
			mimeType: uploadSessions.mimeType,
			storageKey: uploadSessions.storageKey,
			publicUrl: uploadSessions.publicUrl,
			checksumAlgorithm: uploadSessions.checksumAlgorithm,
			finalChecksum: uploadSessions.finalChecksum,
			errorCode: uploadSessions.errorCode,
			errorMessage: uploadSessions.errorMessage,
			declaredSize: uploadSessions.declaredSize,
			receivedBytes: uploadSessions.receivedBytes,
			expiresAt: uploadSessions.expiresAt,
			completedAt: uploadSessions.completedAt,
			cancelledAt: uploadSessions.cancelledAt,
			createdAt: uploadSessions.createdAt,
			updatedAt: uploadSessions.updatedAt,
		})
		.from(uploadSessions)
		.where(eq(uploadSessions.id, id))
		.limit(1);

	return rows[0] ?? null;
}

export async function listUploadSessionsForResource(db: DrizzleDB, resourceId: string) {
	return db
		.select({
			id: uploadSessions.id,
			resourceId: uploadSessions.resourceId,
			ownerId: uploadSessions.ownerId,
			mediaItemId: uploadSessions.mediaItemId,
			status: uploadSessions.status,
			originalFilename: uploadSessions.originalFilename,
			mimeType: uploadSessions.mimeType,
			storageKey: uploadSessions.storageKey,
			publicUrl: uploadSessions.publicUrl,
			checksumAlgorithm: uploadSessions.checksumAlgorithm,
			finalChecksum: uploadSessions.finalChecksum,
			errorCode: uploadSessions.errorCode,
			errorMessage: uploadSessions.errorMessage,
			declaredSize: uploadSessions.declaredSize,
			receivedBytes: uploadSessions.receivedBytes,
			expiresAt: uploadSessions.expiresAt,
			completedAt: uploadSessions.completedAt,
			cancelledAt: uploadSessions.cancelledAt,
			createdAt: uploadSessions.createdAt,
			updatedAt: uploadSessions.updatedAt,
		})
		.from(uploadSessions)
		.where(eq(uploadSessions.resourceId, resourceId))
		.orderBy(desc(uploadSessions.updatedAt), asc(uploadSessions.originalFilename));
}

export async function updateUploadSessionProgress(
	db: DrizzleDB,
	id: string,
	data: { receivedBytes: number; status?: string },
) {
	await db
		.update(uploadSessions)
		.set({
			receivedBytes: data.receivedBytes,
			status: data.status ?? "uploading",
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(uploadSessions.id, id),
				notInArray(uploadSessions.status, ["completed", "cancelled", "failed"]),
			),
		);
}

export async function completeUploadSession(
	db: DrizzleDB,
	id: string,
	data: { receivedBytes: number; publicUrl: string; mediaItemId: string; finalChecksum?: string | null },
) {
	await db
		.update(uploadSessions)
		.set({
			status: "completed",
			receivedBytes: data.receivedBytes,
			publicUrl: data.publicUrl,
			mediaItemId: data.mediaItemId,
			finalChecksum: data.finalChecksum || null,
			completedAt: new Date(),
			updatedAt: new Date(),
		})
		.where(eq(uploadSessions.id, id));
}

export async function failUploadSession(
	db: DrizzleDB,
	id: string,
	data: { code?: string | null; message?: string | null },
) {
	await db
		.update(uploadSessions)
		.set({
			status: "failed",
			errorCode: data.code ?? null,
			errorMessage: data.message ?? null,
			updatedAt: new Date(),
		})
		.where(eq(uploadSessions.id, id));
}

export async function cancelUploadSession(db: DrizzleDB, id: string) {
	await db
		.update(uploadSessions)
		.set({
			status: "cancelled",
			cancelledAt: new Date(),
			updatedAt: new Date(),
		})
		.where(eq(uploadSessions.id, id));
}
