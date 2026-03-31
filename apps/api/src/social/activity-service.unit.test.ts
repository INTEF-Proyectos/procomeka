import { describe, expect, test } from "bun:test";
import * as repo from "@procomeka/db/repository";
import { logActivity } from "../activity/log.ts";
import { listUserActivity } from "./activity-service.ts";

describe("activity-service", () => {
	test("returns parsed metadata and serialized dates", async () => {
		const userId = `activity-service-user-${crypto.randomUUID()}`;
		await repo.ensureUser((await import("../db.ts")).getDb().db, {
			id: userId,
			email: `${userId}@local.invalid`,
			name: "Activity Service User",
			role: "author",
		});

		await logActivity({
			userId,
			type: "activity_service_test",
			description: "Actividad del servicio",
			metadata: { source: "unit-test" },
		});

		const result = await listUserActivity({ userId, limit: 10, offset: 0 });
		expect(result.total).toBeGreaterThanOrEqual(1);
		const activity = result.data.find((item) => item.type === "activity_service_test");
		expect(activity).toBeDefined();
		expect(activity?.metadata).toEqual({ source: "unit-test" });
		expect(typeof activity?.createdAt).toBe("string");
	});
});
