import { describe, expect, test } from "bun:test";
import { normalizeMediaUrl } from "./media.ts";

describe("repository shared media", () => {
	test("builds a public upload URL when an upload id exists", () => {
		expect(normalizeMediaUrl("/otra/ruta", "upload-1")).toBe("/api/v1/uploads/upload-1/content");
	});

	test("rewrites legacy admin upload URLs to the public path", () => {
		expect(normalizeMediaUrl("/api/admin/uploads/upload-2/content")).toBe(
			"/api/v1/uploads/upload-2/content",
		);
	});
});
