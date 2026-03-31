import { describe, expect, test } from "bun:test";
import * as repo from "@procomeka/db/repository";
import { getDb } from "../db.ts";
import { getResourceRatingsSummary, upsertResourceRating } from "./ratings-service.ts";

describe("ratings-service", () => {
	test("upserts ratings and exposes aggregated summary", async () => {
		const userId = `rating-user-${crypto.randomUUID()}`;
		await repo.ensureUser(getDb().db, {
			id: userId,
			email: `${userId}@local.invalid`,
			name: "Rating User",
			role: "author",
		});

		const resource = await repo.createResource(getDb().db, {
			title: `Rating Resource ${crypto.randomUUID()}`,
			description: "desc",
			language: "es",
			license: "cc-by",
			resourceType: "documento",
			createdBy: userId,
		});

		await upsertResourceRating({ resourceId: resource.id, userId, score: 4 });
		await upsertResourceRating({ resourceId: resource.id, userId, score: 5 });

		const summary = await getResourceRatingsSummary(resource.id, userId);
		expect(summary.totalRatings).toBe(1);
		expect(summary.averageScore).toBe(5);
		expect(summary.distribution[5]).toBe(1);
		expect(summary.userScore).toBe(5);
	});
});
