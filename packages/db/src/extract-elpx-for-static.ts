/**
 * Extrae los .elpx generados por el seed a public/api/v1/elpx/{hash}/
 * para que el servidor estático pueda servir las previews.
 *
 * Uso: bun run packages/db/src/extract-elpx-for-static.ts
 * Ejecutar DESPUÉS de `bun run cli seed` y `bun run packages/db/src/generate-seed-json.ts`
 */
import { execSync } from "node:child_process";
import { readFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dir, "../../..");
const seedJsonPath = path.join(repoRoot, "apps/frontend/public/preview/seed.json");
const elpxDemoDir = path.join(repoRoot, "apps/api/src/test-fixtures/elpx/demo");
const outputBase = path.join(repoRoot, "apps/frontend/public/api/v1/elpx");

// Load seed.json to get hash → resource mapping
const seedJson = JSON.parse(readFileSync(seedJsonPath, "utf-8"));
const resources = seedJson.resources as { id: string; slug: string }[];
const elpxProjects = seedJson.elpxProjects as { resourceId: string; hash: string; originalFilename: string }[];

// Map resourceId → slug for finding the .elpx file
const slugMap = new Map(resources.map((r) => [r.id, r.slug]));

let extracted = 0;
for (const proj of elpxProjects) {
	const slug = slugMap.get(proj.resourceId);
	if (!slug) continue;

	const elpxFile = path.join(elpxDemoDir, `demo-${slug}.elpx`);
	if (!existsSync(elpxFile)) {
		console.log(`  ⚠ No encontrado: demo-${slug}.elpx`);
		continue;
	}

	const outDir = path.join(outputBase, proj.hash);
	mkdirSync(outDir, { recursive: true });

	// Extract the .elpx (ZIP) to the output directory
	execSync(`unzip -qo "${elpxFile}" -d "${outDir}"`, { stdio: "ignore" });
	extracted++;
}

console.log(`Extraídos ${extracted} .elpx a ${outputBase}`);
console.log(`Los previews estarán disponibles en /api/v1/elpx/{hash}/index.html`);
