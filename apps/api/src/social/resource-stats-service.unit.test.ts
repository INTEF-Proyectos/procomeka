import { describe, expect, test } from "bun:test";
import * as repo from "@procomeka/db/repository";
import { getDb } from "../db.ts";
import { toggleResourceFavorite } from "./favorites-service.ts";
import { upsertResourceRating } from "./ratings-service.ts";
import { getResourceSocialStats, incrementDownload } from "./resource-stats-service.ts";

describe("resource-stats-service", () => {
	test("aggregates download, favorite and rating stats", async () => {
		const userId = `stats-user-${crypto.randomUUID()}`;
		await repo.ensureUser(getDb().db, {
			id: userId,
			email: `${userId}@local.invalid`,
			name: "Stats User",
			role: "author",
		});

		const resource = await repo.createResource(getDb().db, {
			title: `Stats Resource ${crypto.randomUUID()}`,
			description: "desc",
			language: "es",
			license: "cc-by",
			resourceType: "documento",
			createdBy: userId,
		});

		await incrementDownload(resource.id, userId);
		await toggleResourceFavorite({ resourceId: resource.id, userId });
		await upsertResourceRating({ resourceId: resource.id, userId, score: 5 });

		const stats = await getResourceSocialStats(resource.id, userId);
		expect(stats.downloadCount).toBe(1);
		expect(stats.favoriteCount).toBe(1);
		expect(stats.ratingAvg).toBe(5);
		expect(stats.ratingCount).toBe(1);
		expect(stats.userFavorited).toBe(true);
	});
});
