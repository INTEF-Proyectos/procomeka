import { describe, expect, test } from "bun:test";
import * as repo from "@procomeka/db/repository";
import { getDb } from "../db.ts";
import {
	getFavoriteCount,
	getUserFavoriteState,
	toggleResourceFavorite,
} from "./favorites-service.ts";

describe("favorites-service", () => {
	test("toggles favorites and exposes count/state", async () => {
		const userId = `favorite-user-${crypto.randomUUID()}`;
		await repo.ensureUser(getDb().db, {
			id: userId,
			email: `${userId}@local.invalid`,
			name: "Favorite User",
			role: "author",
		});

		const resource = await repo.createResource(getDb().db, {
			title: `Favorite Resource ${crypto.randomUUID()}`,
			description: "desc",
			language: "es",
			license: "cc-by",
			resourceType: "documento",
			createdBy: userId,
		});

		const toggledOn = await toggleResourceFavorite({ resourceId: resource.id, userId });
		expect(toggledOn.favorited).toBe(true);
		expect(await getFavoriteCount(resource.id)).toBe(1);
		expect(await getUserFavoriteState(resource.id, userId)).toBe(true);

		const toggledOff = await toggleResourceFavorite({ resourceId: resource.id, userId });
		expect(toggledOff.favorited).toBe(false);
		expect(await getFavoriteCount(resource.id)).toBe(0);
		expect(await getUserFavoriteState(resource.id, userId)).toBe(false);
	});
});
