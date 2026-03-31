import { describe, expect, test } from "bun:test";
import { canViewResource } from "./access.ts";

describe("public access", () => {
	test("published resources are visible to anonymous users", () => {
		expect(
			canViewResource(null, {
				editorialStatus: "published",
				createdBy: "author-1",
			}),
		).toBe(true);
	});

	test("draft resources are hidden from anonymous users", () => {
		expect(
			canViewResource(null, {
				editorialStatus: "draft",
				createdBy: "author-1",
			}),
		).toBe(false);
	});

	test("owners can view their non-published resources", () => {
		expect(
			canViewResource(
				{ id: "author-1", role: "author" },
				{
					editorialStatus: "review",
					createdBy: "author-1",
				},
			),
		).toBe(true);
	});

	test("curators can view non-published resources from other users", () => {
		expect(
			canViewResource(
				{ id: "curator-1", role: "curator" },
				{
					editorialStatus: "review",
					createdBy: "author-1",
				},
			),
		).toBe(true);
	});
});
