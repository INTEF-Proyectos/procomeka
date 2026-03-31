import { platformSettings } from "../schema/settings.ts";
import type { DrizzleDB } from "./shared.ts";

export async function getAllSettings(db: DrizzleDB): Promise<Record<string, string>> {
	const rows = await db.select().from(platformSettings);
	const result: Record<string, string> = {};
	for (const row of rows) {
		result[row.key] = row.value;
	}
	return result;
}

export async function upsertSettings(
	db: DrizzleDB,
	entries: { key: string; value: string }[],
): Promise<void> {
	const now = new Date();
	for (const entry of entries) {
		await db
			.insert(platformSettings)
			.values({ key: entry.key, value: entry.value, updatedAt: now })
			.onConflictDoUpdate({
				target: platformSettings.key,
				set: { value: entry.value, updatedAt: now },
			});
	}
}
