import { describe, expect, test } from "bun:test";
import { buildSlug } from "./slugs.ts";

describe("repository shared slugs", () => {
	test("normalizes titles to ASCII slugs", () => {
		expect(buildSlug("Álgebra y Geometría básica")).toBe("algebra-y-geometria-basica");
	});

	test("removes leading and trailing separators", () => {
		expect(buildSlug(" -- Hola mundo -- ")).toBe("hola-mundo");
	});
});
