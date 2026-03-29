/**
 * Extrae los .elpx generados a public/api/v1/elpx/{hash}/
 * para que el servidor estático pueda servir las previews.
 *
 * Si los .elpx no existen (ej: CI), los genera primero.
 *
 * Uso: bun run packages/db/src/extract-elpx-for-static.ts
 */
import { execSync } from "node:child_process";
import { readFileSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dir, "../../..");
const seedJsonPath = path.join(repoRoot, "apps/frontend/public/preview/seed.json");
const elpxDemoDir = path.join(repoRoot, "apps/api/src/test-fixtures/elpx/demo");
const outputBase = path.join(repoRoot, "apps/frontend/public/api/v1/elpx");
const outputRawDir = path.join(repoRoot, "apps/frontend/public/api/v1/elpx-raw");

// Load seed.json
const seedJson = JSON.parse(readFileSync(seedJsonPath, "utf-8"));
const resources = seedJson.resources as { id: string; slug: string }[];
const elpxProjects = seedJson.elpxProjects as { resourceId: string; hash: string; originalFilename: string }[];
const slugMap = new Map(resources.map((r) => [r.id, r.slug]));

// Check if demo .elpx files exist; generate them if not
const firstSlug = slugMap.get(elpxProjects[0]?.resourceId ?? "");
const firstElpx = firstSlug ? path.join(elpxDemoDir, `demo-${firstSlug}.elpx`) : "";
if (!firstElpx || !existsSync(firstElpx)) {
	console.log("Los .elpx demo no existen, generandolos...");
	try {
		execSync(`bun run ${path.join(repoRoot, "apps/cli/src/commands/generate-elpx-standalone.ts")}`, {
			cwd: repoRoot,
			stdio: "inherit",
		});
	} catch {
		console.log("No se pudieron generar los .elpx (plantillas no disponibles). Previews no disponibles.");
		process.exit(0);
	}
}

mkdirSync(outputRawDir, { recursive: true });

let extracted = 0;
for (const proj of elpxProjects) {
	const slug = slugMap.get(proj.resourceId);
	if (!slug) continue;

	const elpxFile = path.join(elpxDemoDir, `demo-${slug}.elpx`);
	if (!existsSync(elpxFile)) continue;

	const outDir = path.join(outputBase, proj.hash);
	mkdirSync(outDir, { recursive: true });
	execSync(`unzip -qo "${elpxFile}" -d "${outDir}"`, { stdio: "ignore" });

	// Copy raw .elpx so the editor and download links can load it
	copyFileSync(elpxFile, path.join(outputRawDir, `${proj.hash}.elpx`));
	extracted++;
}

console.log(`Extraidos ${extracted} .elpx a ${outputBase}`);
