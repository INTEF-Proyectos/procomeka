import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { SEARCH_ROOTS } from "./run-bun-suite.ts";

const TEST_SUFFIXES = [".unit.test.ts", ".integration.test.ts", ".test.ts"] as const;

const EXCLUDED_PREFIXES = [
	"apps/api/static/",
	"apps/cli/src/",
	"apps/frontend/public/",
	"apps/frontend/scripts/",
	"apps/frontend/src/hooks/",
	"apps/frontend/src/islands/",
	"apps/frontend/src/lib/mock/",
	"apps/frontend/src/lib/types/",
	"apps/frontend/src/ui/",
	"packages/db/src/schema/",
] as const;

const EXCLUDED_EXACT_FILES = new Set([
	"apps/api/src/db.ts",
	"apps/api/src/helpers.ts",
	"apps/api/src/test-setup.ts",
	"apps/frontend/astro.config.ts",
	"apps/frontend/src/lib/api-client.ts",
	"apps/frontend/src/lib/catalog-controller.ts",
	"apps/frontend/src/lib/catalog-events.ts",
	"apps/frontend/src/lib/elpx-preview-service.ts",
	"apps/frontend/src/lib/get-api-client.ts",
	"apps/frontend/src/lib/http-api-client.ts",
	"apps/frontend/src/lib/i18n.ts",
	"apps/frontend/src/lib/paraglide-client.ts",
	"apps/frontend/src/lib/paths.ts",
	"apps/frontend/src/lib/preview-api-client.ts",
	"apps/frontend/src/lib/preview-file-store.ts",
	"apps/frontend/src/lib/resource-display.ts",
	"apps/frontend/src/lib/resource-filters.ts",
	"apps/frontend/src/lib/shared-utils.ts",
	"packages/db/drizzle.config.ts",
	"packages/db/src/elpx-metadata.ts",
	"packages/db/src/extract-elpx-for-static.ts",
	"packages/db/src/generate-seed-json.ts",
	"packages/db/src/index.ts",
	"packages/db/src/seed-data.ts",
	"packages/db/src/seed-random.ts",
	"packages/db/src/setup.ts",
	"packages/db/src/validation.ts",
]) as Set<string>;

type TestGroup = {
	sourcePrefix?: string;
	sourceExact?: string;
	tests: string[];
};

const ALTERNATIVE_TEST_GROUPS: TestGroup[] = [
	{
		sourceExact: "apps/api/src/app.ts",
		tests: ["apps/api/src/index.unit.test.ts"],
	},
	{
		sourceExact: "apps/api/src/auth/urls.ts",
		tests: ["apps/api/src/auth/config.unit.test.ts"],
	},
	{
		sourceExact: "apps/api/src/public/service.ts",
		tests: ["apps/api/src/index.unit.test.ts"],
	},
	{
		sourceExact: "apps/api/src/routes/public.ts",
		tests: ["apps/api/src/index.unit.test.ts"],
	},
	{
		sourceExact: "apps/api/src/routes/social.ts",
		tests: ["apps/api/src/routes/social.unit.test.ts"],
	},
	{
		sourceExact: "apps/api/src/social/service.ts",
		tests: ["apps/api/src/routes/social.unit.test.ts"],
	},
	{
		sourceExact: "apps/api/src/routes/elpx-content.ts",
		tests: [
			"apps/api/src/services/elpx-fixtures.unit.test.ts",
			"apps/api/src/services/elpx-processor.unit.test.ts",
		],
	},
	{
		sourcePrefix: "apps/api/src/routes/admin/",
		tests: ["apps/api/src/routes/admin.unit.test.ts"],
	},
	{
		sourcePrefix: "packages/db/src/repository/",
		tests: ["packages/db/src/repository.unit.test.ts"],
	},
];

type MissingTestPair = {
	source: string;
	acceptedTests: string[];
};

async function walkDirectory(rootDir: string, currentDir: string): Promise<string[]> {
	const entries = await readdir(currentDir, { withFileTypes: true });
	const files: string[] = [];

	for (const entry of entries) {
		const absolutePath = join(currentDir, entry.name);

		if (entry.isDirectory()) {
			files.push(...(await walkDirectory(rootDir, absolutePath)));
			continue;
		}

		if (!entry.isFile()) {
			continue;
		}

		files.push(relative(rootDir, absolutePath).replaceAll("\\", "/"));
	}

	return files;
}

export function isTestFile(filePath: string) {
	return TEST_SUFFIXES.some((suffix) => filePath.endsWith(suffix));
}

export function isExcludedSourceFile(filePath: string) {
	if (filePath.endsWith(".d.ts")) return true;
	if (isTestFile(filePath)) return true;
	if (EXCLUDED_EXACT_FILES.has(filePath)) return true;
	return EXCLUDED_PREFIXES.some((prefix) => filePath.startsWith(prefix));
}

export function getAcceptedTestsForSource(filePath: string) {
	const acceptedTests = new Set(
		TEST_SUFFIXES.map((suffix) => filePath.replace(/\.ts$/, suffix)),
	);

	for (const group of ALTERNATIVE_TEST_GROUPS) {
		if (group.sourceExact === filePath || (group.sourcePrefix && filePath.startsWith(group.sourcePrefix))) {
			for (const testFile of group.tests) {
				acceptedTests.add(testFile);
			}
		}
	}

	return [...acceptedTests].sort();
}

export async function listTrackedTypescriptFiles(
	rootDir = process.cwd(),
	searchRoots: readonly string[] = SEARCH_ROOTS,
) {
	const files = new Set<string>();

	for (const searchRoot of searchRoots) {
		const absoluteSearchRoot = join(rootDir, searchRoot);

		try {
			const nestedFiles = await walkDirectory(rootDir, absoluteSearchRoot);
			for (const file of nestedFiles) {
				if (file.endsWith(".ts")) {
					files.add(file);
				}
			}
		} catch (error) {
			if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") {
				throw error;
			}
		}
	}

	return [...files].sort();
}

export function findMissingTestPairs(
	sourceFiles: string[],
	testFiles: string[],
): MissingTestPair[] {
	const availableTests = new Set(testFiles);

	return sourceFiles
		.filter((file) => !isExcludedSourceFile(file))
		.map((source) => ({
			source,
			acceptedTests: getAcceptedTestsForSource(source),
		}))
		.filter(({ acceptedTests }) => !acceptedTests.some((testFile) => availableTests.has(testFile)));
}

async function main() {
	const files = await listTrackedTypescriptFiles();
	const testFiles = files.filter(isTestFile);
	const missing = findMissingTestPairs(files, testFiles);

	if (missing.length === 0) {
		console.log("All tracked TypeScript source files have an accepted test file.");
		return;
	}

	console.error("Missing test coverage pairs for the following TypeScript files:");
	for (const item of missing) {
		console.error(`- ${item.source}`);
		console.error(`  Accepted tests: ${item.acceptedTests.join(", ")}`);
	}

	process.exit(1);
}

if (import.meta.main) {
	await main();
}
