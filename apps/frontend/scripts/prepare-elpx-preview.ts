/**
 * Extrae fixtures .elpx al directorio public para que funcionen
 * en la versión estática (GitHub Pages / preview).
 *
 * Uso: bun run apps/frontend/scripts/prepare-elpx-preview.ts
 */
import path from "node:path";
import { readdir, mkdir, rm, readFile, writeFile } from "node:fs/promises";
import { processElpxUpload } from "../../api/src/services/elpx-processor.ts";

const FIXTURES_DIR = path.resolve(import.meta.dir, "../../api/src/test-fixtures/elpx");
// processElpxUpload creates {baseDir}/elpx/{hash}/ — so baseDir must be the parent of "elpx"
const PUBLIC_ELPX_BASE = path.resolve(import.meta.dir, "../public/api/v1");
const PUBLIC_ELPX_DIR = path.join(PUBLIC_ELPX_BASE, "elpx");
const SEED_JSON = path.resolve(import.meta.dir, "../public/preview/seed.json");

// Use only small fixtures to keep the static build light
const SELECTED_FIXTURES = [
	"really-simple-test-project.elpx",
	"mermaid.elpx",
	"propiedades.elpx",
	"idevice-text.elpx",
];

async function main() {
	console.log("Preparando previews .elpx para versión estática...\n");

	// Clean previous extractions
	await rm(PUBLIC_ELPX_DIR, { recursive: true, force: true });
	await mkdir(PUBLIC_ELPX_BASE, { recursive: true });

	const results: { resourceId: string; hash: string; filename: string }[] = [];

	for (const fixture of SELECTED_FIXTURES) {
		const fixturePath = path.join(FIXTURES_DIR, fixture);
		try {
			const result = await processElpxUpload(fixturePath, PUBLIC_ELPX_BASE);
			results.push({ resourceId: "", hash: result.hash, filename: fixture });
			console.log(`  + ${fixture} → ${result.hash.slice(0, 12)}...`);
		} catch (err) {
			console.error(`  ✗ ${fixture}: ${err}`);
		}
	}

	// Update seed.json with real hashes
	const seedRaw = await readFile(SEED_JSON, "utf-8");
	const seed = JSON.parse(seedRaw);

	// Assign one fixture per published resource
	const publishedResources = seed.resources.filter(
		(r: { editorialStatus: string }) => r.editorialStatus === "published",
	);

	seed.elpxProjects = publishedResources.map(
		(r: { id: string }, i: number) => {
			const result = results[i % results.length];
			return {
				id: `elpx-${r.id}`,
				resourceId: r.id,
				hash: result.hash,
				hasPreview: 1,
				originalFilename: result.filename,
			};
		},
	);

	await writeFile(SEED_JSON, JSON.stringify(seed, null, "\t") + "\n");
	console.log(`\nSeed.json actualizado con ${seed.elpxProjects.length} proyectos elpx.`);
	console.log(`Archivos en: ${PUBLIC_ELPX_DIR}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
