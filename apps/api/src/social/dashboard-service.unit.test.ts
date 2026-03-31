import { describe, expect, test } from "bun:test";
import * as repo from "@procomeka/db/repository";
import { getDb } from "../db.ts";
import { toggleResourceFavorite } from "./favorites-service.ts";
import { upsertResourceRating } from "./ratings-service.ts";
import { getUserDashboardSummary } from "./dashboard-service.ts";

describe("dashboard-service", () => {
	test("returns user counts and enriched recent resources", async () => {
		const userId = `dashboard-user-${crypto.randomUUID()}`;
		await repo.ensureUser(getDb().db, {
			id: userId,
			email: `${userId}@local.invalid`,
			name: "Dashboard User",
			role: "author",
		});

		const draft = await repo.createResource(getDb().db, {
			title: `Draft ${crypto.randomUUID()}`,
			description: "desc",
			language: "es",
			license: "cc-by",
			resourceType: "documento",
			createdBy: userId,
		});
		const published = await repo.createResource(getDb().db, {
			title: `Published ${crypto.randomUUID()}`,
			description: "desc",
			language: "es",
			license: "cc-by",
			resourceType: "documento",
			createdBy: userId,
		});
		await repo.updateEditorialStatus(getDb().db, published.id, "published", userId);
		await toggleResourceFavorite({ resourceId: published.id, userId });
		await upsertResourceRating({ resourceId: published.id, userId, score: 4 });

		const summary = await getUserDashboardSummary(userId);
		expect(summary.draftCount).toBeGreaterThanOrEqual(1);
		expect(summary.publishedCount).toBeGreaterThanOrEqual(1);
		expect(summary.favoriteCount).toBe(1);
		expect(summary.ratingCount).toBe(1);
		expect(summary.recentResources.some((resource) => resource.id === draft.id)).toBe(true);
		expect(summary.recentResources.some((resource) => resource.id === published.id)).toBe(true);
		expect(summary.recentResources.find((resource) => resource.id === published.id)?.rating.count).toBe(1);
	});
});
