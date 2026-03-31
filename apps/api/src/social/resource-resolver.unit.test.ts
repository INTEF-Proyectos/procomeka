import { describe, expect, test } from "bun:test";
import * as repo from "@procomeka/db/repository";
import { getDb } from "../db.ts";
import { resolveResourceBySlug } from "./resource-resolver.ts";

describe("resolveResourceBySlug", () => {
	test("returns the resource summary for an existing slug", async () => {
		const result = await repo.createResource(getDb().db, {
			title: `Resolver ${crypto.randomUUID()}`,
			description: "desc",
			language: "es",
			license: "cc-by",
			resourceType: "documento",
		});

		const resource = await resolveResourceBySlug(result.slug);
		expect(resource).not.toBeNull();
		expect(resource?.id).toBe(result.id);
		expect(resource?.slug).toBe(result.slug);
	});
});
