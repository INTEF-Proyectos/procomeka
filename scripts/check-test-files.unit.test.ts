import { describe, expect, test } from "bun:test";
import {
	findMissingTestPairs,
	getAcceptedTestsForSource,
	isExcludedSourceFile,
	isTestFile,
} from "./check-test-files.ts";

describe("check-test-files helpers", () => {
	test("recognizes supported test suffixes", () => {
		expect(isTestFile("apps/api/src/app/routes.unit.test.ts")).toBe(true);
		expect(isTestFile("packages/db/src/repository.test.ts")).toBe(true);
		expect(isTestFile("apps/api/src/routes/social.ts")).toBe(false);
	});

	test("excludes declarations, schemas and configured support files", () => {
		expect(isExcludedSourceFile("apps/api/static/editor/pixo.d.ts")).toBe(true);
		expect(isExcludedSourceFile("packages/db/src/schema/resources.ts")).toBe(true);
		expect(isExcludedSourceFile("apps/api/src/db.ts")).toBe(true);
		expect(isExcludedSourceFile("apps/api/src/elpx/preview.ts")).toBe(false);
	});

	test("accepts aggregate test files for grouped modules", () => {
		expect(getAcceptedTestsForSource("apps/api/src/routes/admin/settings.ts")).toContain(
			"apps/api/src/routes/admin.unit.test.ts",
		);
		expect(getAcceptedTestsForSource("packages/db/src/repository/collections.ts")).toContain(
			"packages/db/src/repository.unit.test.ts",
		);
	});

	test("reports missing source files when no accepted test exists", () => {
		const missing = findMissingTestPairs(
			[
				"apps/api/src/elpx/preview.ts",
				"apps/api/src/routes/social.ts",
				"packages/db/src/schema/resources.ts",
			],
			["apps/api/src/routes/social.unit.test.ts"],
		);

		expect(missing).toEqual([
			{
				source: "apps/api/src/elpx/preview.ts",
				acceptedTests: ["apps/api/src/elpx/preview.integration.test.ts", "apps/api/src/elpx/preview.test.ts", "apps/api/src/elpx/preview.unit.test.ts"],
			},
		]);
	});
});
