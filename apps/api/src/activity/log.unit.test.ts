import { describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import * as repo from "@procomeka/db/repository";
import { activityEvents } from "@procomeka/db/schema";
import { getDb } from "../db.ts";
import { logActivity } from "./log.ts";

describe("logActivity", () => {
	test("stores activity events without throwing", async () => {
		const userId = `activity-user-${crypto.randomUUID()}`;
		await repo.ensureUser(getDb().db, {
			id: userId,
			email: `${userId}@local.invalid`,
			name: "Activity User",
			role: "author",
		});

		await logActivity({
			userId,
			type: "test_activity",
			description: "Actividad de prueba",
			metadata: { origin: "unit-test" },
		});

		const rows = await getDb().db
			.select({
				type: activityEvents.type,
				description: activityEvents.description,
				metadata: activityEvents.metadata,
			})
			.from(activityEvents)
			.where(eq(activityEvents.userId, userId));

		expect(rows.some((row) => row.type === "test_activity")).toBe(true);
		expect(rows.some((row) => row.description === "Actividad de prueba")).toBe(true);
	});
});
