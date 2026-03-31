import { describe, expect, test } from "bun:test";
import { buildElpxMap, buildElpxPreview } from "./preview.ts";

describe("elpx preview helpers", () => {
	test("buildElpxPreview returns null when preview is unavailable", () => {
		expect(buildElpxPreview(null)).toBeNull();
		expect(buildElpxPreview({ hash: "abc", hasPreview: false })).toBeNull();
		expect(buildElpxPreview({ hasPreview: true })).toBeNull();
	});

	test("buildElpxPreview builds the public preview URL", () => {
		expect(buildElpxPreview({ hash: "abc123", hasPreview: true })).toEqual({
			hash: "abc123",
			previewUrl: "/api/v1/elpx/abc123/",
		});
	});

	test("buildElpxMap indexes rows by resourceId", () => {
		const rows = [
			{ resourceId: "res-1", hash: "hash-1", hasPreview: true },
			{ resourceId: "res-2", hash: "hash-2", hasPreview: false },
		];

		const map = buildElpxMap(rows);
		expect(map.get("res-1")).toEqual(rows[0]);
		expect(map.get("res-2")).toEqual(rows[1]);
	});
});
