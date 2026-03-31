import { describe, expect, test } from "bun:test";
import { buildSearchTerm, normalizePagination, optionalAndWhere } from "./filters.ts";

describe("repository shared filters", () => {
	test("buildSearchTerm removes accents and normalizes casing", () => {
		expect(buildSearchTerm("Matemáticas")).toBe("%matematicas%");
	});

	test("normalizePagination applies defaults and max limit", () => {
		expect(normalizePagination()).toEqual({ limit: 20, offset: 0 });
		expect(normalizePagination(250, 4, 100)).toEqual({ limit: 100, offset: 4 });
	});

	test("optionalAndWhere returns undefined for empty conditions", () => {
		expect(optionalAndWhere([])).toBeUndefined();
	});
});
