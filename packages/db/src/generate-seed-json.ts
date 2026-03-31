/**
 * Genera seed.json para el preview (PGlite en navegador)
 * a partir de seed-data.ts — fuente única de verdad.
 *
 * Uso: bun run packages/db/src/generate-seed-json.ts
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import {
	DEMO_USERS,
	DEMO_RESOURCES,
	DEMO_COLLECTIONS,
	DEMO_RATINGS,
	DEMO_FAVORITES,
} from "./seed-data.ts";

// Genera un hash determinista y único por recurso (para elpxProjects en preview)
function deterministicHash(id: string): string {
	// Use the resource ID directly as part of the hash to guarantee uniqueness
	return `preview-elpx-${id}`;
}

const seedJson = {
	users: DEMO_USERS.map(({ password, ...u }) => u),
	resources: DEMO_RESOURCES.map((r) => ({
		id: r.id,
		slug: r.slug,
		title: r.title,
		description: r.description,
		language: r.language,
		license: r.license,
		resourceType: r.resourceType,
		keywords: r.keywords,
		author: r.author,
		publisher: r.publisher,
		createdBy: r.createdBy,
		editorialStatus: r.editorialStatus,
		featuredAt: r.featuredAt,
		createdAt: r.createdAt,
	})),
	resourceSubjects: DEMO_RESOURCES.flatMap((r) =>
		r.subjects.map((subject) => ({ resourceId: r.id, subject })),
	),
	resourceLevels: DEMO_RESOURCES.flatMap((r) =>
		r.levels.map((level) => ({ resourceId: r.id, level })),
	),
	// elpxProjects: cada recurso tiene un proyecto elpx asociado para preview
	elpxProjects: DEMO_RESOURCES.map((r) => ({
		id: `elpx-${r.id}`,
		resourceId: r.id,
		hash: deterministicHash(r.id),
		originalFilename: `demo-${r.slug}.elpx`,
		hasPreview: 1,
	})),
	// mediaItems: cada recurso publicado tiene su .elpx como archivo descargable
	mediaItems: DEMO_RESOURCES
		.filter((r) => r.editorialStatus === "published")
		.map((r) => ({
			id: `media-${r.id}`,
			resourceId: r.id,
			type: "elpx",
			mimeType: "application/zip",
			url: `api/v1/elpx-raw/${deterministicHash(r.id)}.elpx`,
			fileSize: null,
			filename: `demo-${r.slug}.elpx`,
			isPrimary: 1,
		})),
	collections: DEMO_COLLECTIONS.map((c) => ({
		id: c.id,
		slug: c.slug,
		title: c.title,
		description: c.description,
		curatorId: c.curatorId,
		resourceIds: c.resourceIds,
	})),
	ratings: DEMO_RATINGS,
	favorites: DEMO_FAVORITES,
	activityEvents: [
		{ userId: "user-humberto", type: "resource_published", resourceId: "res-01", resourceTitle: DEMO_RESOURCES[0]!.title, resourceSlug: DEMO_RESOURCES[0]!.slug, description: "Publico un nuevo recurso", daysAgo: 1 },
		{ userId: "user-carlos", type: "resource_published", resourceId: "res-02", resourceTitle: DEMO_RESOURCES[1]!.title, resourceSlug: DEMO_RESOURCES[1]!.slug, description: "Publico un nuevo recurso", daysAgo: 2 },
		{ userId: "user-fran", type: "favorite_added", resourceId: "res-01", resourceTitle: DEMO_RESOURCES[0]!.title, resourceSlug: DEMO_RESOURCES[0]!.slug, description: "Anadio un recurso a favoritos", daysAgo: 3 },
		{ userId: "user-humberto", type: "rating_given", resourceId: "res-03", resourceTitle: DEMO_RESOURCES[2]!.title, resourceSlug: DEMO_RESOURCES[2]!.slug, description: "Valoro un recurso con 5 estrellas", daysAgo: 4 },
		{ userId: "user-carlos", type: "resource_published", resourceId: "res-11", resourceTitle: DEMO_RESOURCES[10]!.title, resourceSlug: DEMO_RESOURCES[10]!.slug, description: "Publico un nuevo recurso", daysAgo: 5 },
		{ userId: "user-humberto2", type: "resource_published", resourceId: "res-20", resourceTitle: DEMO_RESOURCES[19]!.title, resourceSlug: DEMO_RESOURCES[19]!.slug, description: "Publico un nuevo recurso", daysAgo: 6 },
		{ userId: "user-yanira", type: "favorite_added", resourceId: "res-07", resourceTitle: DEMO_RESOURCES[6]!.title, resourceSlug: DEMO_RESOURCES[6]!.slug, description: "Anadio un recurso a favoritos", daysAgo: 7 },
		{ userId: "user-carlos2", type: "resource_created", resourceId: "res-22", resourceTitle: DEMO_RESOURCES[21]!.title, resourceSlug: DEMO_RESOURCES[21]!.slug, description: "Creo un borrador", daysAgo: 1 },
		{ userId: "user-catedra", type: "resource_created", resourceId: "res-21", resourceTitle: DEMO_RESOURCES[20]!.title, resourceSlug: DEMO_RESOURCES[20]!.slug, description: "Creo un borrador", daysAgo: 2 },
		{ userId: "demo-admin", type: "resource_published", resourceId: "res-17", resourceTitle: DEMO_RESOURCES[16]!.title, resourceSlug: DEMO_RESOURCES[16]!.slug, description: "Publico un nuevo recurso", daysAgo: 10 },
		{ userId: "user-fran", type: "resource_published", resourceId: "res-07", resourceTitle: DEMO_RESOURCES[6]!.title, resourceSlug: DEMO_RESOURCES[6]!.slug, description: "Publico un nuevo recurso", daysAgo: 12 },
		{ userId: "user-carlos", type: "rating_given", resourceId: "res-01", resourceTitle: DEMO_RESOURCES[0]!.title, resourceSlug: DEMO_RESOURCES[0]!.slug, description: "Valoro un recurso con 5 estrellas", daysAgo: 8 },
		{ userId: "user-humberto2", type: "resource_published", resourceId: "res-15", resourceTitle: DEMO_RESOURCES[14]!.title, resourceSlug: DEMO_RESOURCES[14]!.slug, description: "Publico un nuevo recurso", daysAgo: 15 },
		{ userId: "user-carlos2", type: "rating_given", resourceId: "res-07", resourceTitle: DEMO_RESOURCES[6]!.title, resourceSlug: DEMO_RESOURCES[6]!.slug, description: "Valoro un recurso con 5 estrellas", daysAgo: 9 },
		{ userId: "demo-curator", type: "favorite_added", resourceId: "res-01", resourceTitle: DEMO_RESOURCES[0]!.title, resourceSlug: DEMO_RESOURCES[0]!.slug, description: "Anadio un recurso a favoritos", daysAgo: 4 },
	],
};

const outPath = path.resolve(
	import.meta.dir,
	"../../../apps/frontend/public/preview/seed.json",
);

writeFileSync(outPath, JSON.stringify(seedJson, null, "\t"));
console.log(`seed.json generado: ${outPath} (${Object.keys(seedJson).length} secciones)`);
