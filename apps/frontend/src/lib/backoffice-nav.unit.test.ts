import { describe, expect, test } from "bun:test";
import { canAccessSection, getVisibleSections } from "./backoffice-nav.ts";

describe("backoffice navigation", () => {
	test("reader no ve secciones de backoffice", () => {
		expect(getVisibleSections("reader")).toHaveLength(0);
	});

	test("author no ve colecciones y mantiene ayuda", () => {
		const sections = getVisibleSections("author").map((section) => section.id);
		expect(sections).toEqual(["dashboard", "resources", "help"]);
	});

	test("curator añade categorías", () => {
		expect(canAccessSection("curator", "curator")).toBe(true);
		expect(canAccessSection("author", "curator")).toBe(false);
		expect(getVisibleSections("curator").map((section) => section.id)).toContain("collections");
	});

	test("admin ve todas las secciones", () => {
		expect(getVisibleSections("admin")).toHaveLength(6);
	});
});
