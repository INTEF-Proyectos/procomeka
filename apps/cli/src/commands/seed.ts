import { hashPassword } from "better-auth/crypto";
import path from "node:path";
import {
	DEMO_USERS,
	DEMO_RESOURCES,
	DEMO_COLLECTIONS,
	DEMO_RATINGS,
	DEMO_FAVORITES,
	DEMO_DOWNLOAD_COUNTS,
	ALL_SEED_USER_IDS,
	ALL_SEED_RESOURCE_IDS,
	ALL_SEED_COLLECTION_IDS,
} from "@procomeka/db/seed-data";

type SeedLog = Pick<typeof console, "log">;
type SeedQueryResult = { rows?: unknown[] } | unknown[];
type SeedClient = {
	query: (statement: string, params?: unknown[]) => Promise<SeedQueryResult>;
	close: () => Promise<void>;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getResultLength(result: SeedQueryResult) {
	return Array.isArray(result) ? result.length : result.rows?.length ?? 0;
}

/** Build a SQL IN clause with numbered parameters: ($1,$2,$3) */
function inClause(ids: string[], offset = 1): { sql: string; params: string[] } {
	const placeholders = ids.map((_, i) => `$${i + offset}`).join(",");
	return { sql: `(${placeholders})`, params: ids };
}

export function resolveSeedMode(env: Record<string, string | undefined> = process.env) {
	return env.DATABASE_URL ? "postgres" : "pglite";
}

export function formatPostgresSeedTarget(databaseUrl: string) {
	const url = new URL(databaseUrl);
	const databaseName = url.pathname.replace(/^\//, "") || "(default)";
	return `Base PostgreSQL: ${url.hostname}:${url.port || "5432"}/${databaseName}`;
}

// ---------------------------------------------------------------------------
// Elpx support
// ---------------------------------------------------------------------------

async function loadElpxSupport(log: SeedLog) {
	try {
		const repoRoot = path.resolve(import.meta.dir, "../../../..");
		const storageDir = process.env.UPLOAD_STORAGE_DIR
			?? path.join(repoRoot, "local-data", "uploads");
		const { mkdir } = await import("node:fs/promises");
		await mkdir(storageDir, { recursive: true });

		const { processElpxUpload } = await import("../../../api/src/services/elpx-processor.ts");
		return { processElpx: processElpxUpload, storageDir, repoRoot };
	} catch (err) {
		log.log(`  [elpx] No se pudo cargar el procesador: ${err}`);
		return null;
	}
}

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

export async function seedWithClient(
	client: SeedClient,
	options: { now?: string; log?: SeedLog; successTarget: string },
) {
	const now = options.now ?? new Date().toISOString();
	const log = options.log ?? console;

	try {
		// ── 1. Limpiar datos seed previos (idempotente) ─────────────────────
		log.log("Limpiando datos seed previos...\n");

		const resIn = inClause(ALL_SEED_RESOURCE_IDS);
		const usrIn = inClause(ALL_SEED_USER_IDS);
		const colIn = inClause(ALL_SEED_COLLECTION_IDS);

		// Order matters: respect FK constraints
		await client.query(`DELETE FROM "downloads" WHERE resource_id IN ${resIn.sql}`, resIn.params);
		await client.query(`DELETE FROM "favorites" WHERE resource_id IN ${resIn.sql}`, resIn.params);
		await client.query(`DELETE FROM "ratings" WHERE resource_id IN ${resIn.sql}`, resIn.params);
		await client.query(`DELETE FROM "activity_events" WHERE resource_id IN ${resIn.sql}`, resIn.params);
		// Also clean activity_events by user in case resource was deleted
		await client.query(`DELETE FROM "activity_events" WHERE user_id IN ${usrIn.sql}`, usrIn.params);
		await client.query(`DELETE FROM "collection_resources" WHERE collection_id IN ${colIn.sql}`, colIn.params);
		await client.query(`DELETE FROM "collections" WHERE id IN ${colIn.sql}`, colIn.params);
		await client.query(`DELETE FROM "resource_subjects" WHERE resource_id IN ${resIn.sql}`, resIn.params);
		await client.query(`DELETE FROM "resource_levels" WHERE resource_id IN ${resIn.sql}`, resIn.params);
		await client.query(`DELETE FROM "elpx_projects" WHERE resource_id IN ${resIn.sql}`, resIn.params);
		await client.query(`DELETE FROM "upload_sessions" WHERE resource_id IN ${resIn.sql}`, resIn.params);
		await client.query(`DELETE FROM "media_items" WHERE resource_id IN ${resIn.sql}`, resIn.params);
		await client.query(`DELETE FROM "resources" WHERE id IN ${resIn.sql}`, resIn.params);
		// Nullify created_by for non-seed resources that still reference demo users
		// (e.g. resources created manually during testing) to avoid FK violations on user delete.
		// Build IN clauses with correct parameter offsets so they don't overlap.
		const usrIn2 = inClause(ALL_SEED_USER_IDS);
		const resIn2 = inClause(ALL_SEED_RESOURCE_IDS, ALL_SEED_USER_IDS.length + 1);
		await client.query(
			`UPDATE "resources" SET created_by = NULL WHERE created_by IN ${usrIn2.sql} AND id NOT IN ${resIn2.sql}`,
			[...usrIn2.params, ...resIn2.params],
		);
		await client.query(`DELETE FROM "session" WHERE user_id IN ${usrIn.sql}`, usrIn.params);
		await client.query(`DELETE FROM "account" WHERE user_id IN ${usrIn.sql}`, usrIn.params);
		await client.query(`DELETE FROM "user" WHERE id IN ${usrIn.sql}`, usrIn.params);

		// ── 2. Insertar usuarios ────────────────────────────────────────────
		log.log("Usuarios de demo:\n");
		for (const u of DEMO_USERS) {
			const accountId = crypto.randomUUID();
			const passwordHash = await hashPassword(u.password);

			await client.query(
				`INSERT INTO "user" (id, email, email_verified, name, bio, role, is_active, created_at, updated_at) VALUES ($1, $2, true, $3, $4, $5, true, $6, $7)`,
				[u.id, u.email, u.name, u.bio, u.role, now, now],
			);
			await client.query(
				`INSERT INTO "account" (id, user_id, account_id, provider_id, password, created_at, updated_at) VALUES ($1, $2, $3, 'credential', $4, $5, $6)`,
				[accountId, u.id, u.id, passwordHash, now, now],
			);
			log.log(`  + ${u.email} [${u.role}] — ${u.name}`);
		}

		// ── 3. Insertar recursos ────────────────────────────────────────────
		log.log("\nRecursos de demo:\n");

		const elpxSupport = await loadElpxSupport(log);

		// Generate .elpx files if processor is available
		let generatedElpx: Map<string, string> | null = null;
		if (elpxSupport) {
			const { generateDemoElpx } = await import("./generate-elpx.ts");
			const elpxOutputDir = path.join(elpxSupport.repoRoot, "apps/api/src/test-fixtures/elpx/demo");
			log.log("  Generando archivos .elpx...\n");
			generatedElpx = await generateDemoElpx(DEMO_RESOURCES, elpxOutputDir, log);
			log.log("");
		}

		for (const r of DEMO_RESOURCES) {
			await client.query(
				`INSERT INTO "resources" (id, slug, title, description, language, license, resource_type, keywords, author, publisher, created_by, editorial_status, featured_at, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
				[r.id, r.slug, r.title, r.description, r.language, r.license, r.resourceType, r.keywords, r.author, r.publisher, r.createdBy, r.editorialStatus, r.featuredAt, r.createdAt, now],
			);

			for (const s of r.subjects) {
				await client.query(`INSERT INTO "resource_subjects" (resource_id, subject) VALUES ($1, $2)`, [r.id, s]);
			}
			for (const l of r.levels) {
				await client.query(`INSERT INTO "resource_levels" (resource_id, level) VALUES ($1, $2)`, [r.id, l]);
			}

			// Attach .elpx if generated
			if (elpxSupport && generatedElpx?.has(r.id)) {
				try {
					const { copyFile, mkdir } = await import("node:fs/promises");
					const elpxFilename = generatedElpx.get(r.id)!;
					const elpxPath = path.join(elpxSupport.repoRoot, "apps/api/src/test-fixtures/elpx/demo", elpxFilename);

					const result = await elpxSupport.processElpx(elpxPath, elpxSupport.storageDir);
					const uploadId = crypto.randomUUID();
					const mediaId = crypto.randomUUID();
					const elpxId = crypto.randomUUID();

					// Copy the .elpx raw file to upload storage so download endpoint works
					await mkdir(elpxSupport.storageDir, { recursive: true });
					await copyFile(elpxPath, path.join(elpxSupport.storageDir, uploadId));

					// Create media item
					await client.query(
						`INSERT INTO "media_items" (id, resource_id, type, mime_type, url, filename, is_primary) VALUES ($1, $2, 'file', 'application/zip', $3, $4, true)`,
						[mediaId, r.id, `/api/v1/uploads/${uploadId}/content`, elpxFilename],
					);

					// Create upload session
					await client.query(
						`INSERT INTO "upload_sessions" (id, resource_id, owner_id, media_item_id, status, original_filename, mime_type, storage_key, public_url, received_bytes, completed_at, created_at, updated_at) VALUES ($1, $2, $3, $4, 'completed', $5, 'application/zip', $6, $7, 0, $8, $9, $10)`,
						[uploadId, r.id, r.createdBy, mediaId, elpxFilename, `resource/${r.id}/${uploadId}/${elpxFilename}`, `/api/v1/uploads/${uploadId}/content`, now, now, now],
					);

					// Create elpx project
					await client.query(
						`INSERT INTO "elpx_projects" (id, resource_id, hash, extract_path, original_filename, version, has_preview, elpx_metadata, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, 3, $6, $7, $8, $9)`,
						[elpxId, r.id, result.hash, result.extractPath, elpxFilename, result.hasPreview, JSON.stringify(result.metadata), now, now],
					);

					log.log(`  + ${r.slug} [${r.editorialStatus}] + elpx`);
				} catch (err) {
					log.log(`  + ${r.slug} [${r.editorialStatus}] (elpx error: ${err})`);
				}
			} else {
				log.log(`  + ${r.slug} [${r.editorialStatus}]`);
			}
		}

		// ── 4. Insertar colecciones ─────────────────────────────────────────
		log.log("\nColecciones:\n");

		for (const col of DEMO_COLLECTIONS) {
			await client.query(
				`INSERT INTO "collections" (id, slug, title, description, is_ordered, editorial_status, curator_id, created_at, updated_at) VALUES ($1, $2, $3, $4, true, 'published', $5, $6, $7)`,
				[col.id, col.slug, col.title, col.description, col.curatorId, now, now],
			);

			for (let i = 0; i < col.resourceIds.length; i++) {
				await client.query(
					`INSERT INTO "collection_resources" (collection_id, resource_id, position) VALUES ($1, $2, $3)`,
					[col.id, col.resourceIds[i], i],
				);
			}

			log.log(`  + ${col.title} (${col.resourceIds.length} recursos)`);
		}

		// ── 5. Insertar valoraciones ────────────────────────────────────────
		log.log("\nValoraciones:\n");

		for (const rating of DEMO_RATINGS) {
			await client.query(
				`INSERT INTO "ratings" (id, resource_id, user_id, score, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)`,
				[crypto.randomUUID(), rating.resourceId, rating.userId, rating.score, now, now],
			);
		}
		log.log(`  + ${DEMO_RATINGS.length} valoraciones`);

		// ── 6. Insertar favoritos ───────────────────────────────────────────
		for (const fav of DEMO_FAVORITES) {
			await client.query(
				`INSERT INTO "favorites" (id, resource_id, user_id, created_at) VALUES ($1, $2, $3, $4)`,
				[crypto.randomUUID(), fav.resourceId, fav.userId, now],
			);
		}
		log.log(`  + ${DEMO_FAVORITES.length} favoritos`);

		// ── 7. Insertar descargas ───────────────────────────────────────────
		log.log("\nDescargas:\n");

		const userIds = ALL_SEED_USER_IDS;
		let totalDownloads = 0;

		for (const [resourceId, count] of Object.entries(DEMO_DOWNLOAD_COUNTS)) {
			// Generate download rows in batches
			const batchSize = 50;
			for (let i = 0; i < count; i += batchSize) {
				const batch = Math.min(batchSize, count - i);
				const values: string[] = [];
				const params: unknown[] = [];
				let paramIdx = 1;

				for (let j = 0; j < batch; j++) {
					// Spread downloads over the last 90 days
					const daysAgo = Math.floor(Math.random() * 90);
					const downloadDate = new Date(Date.now() - daysAgo * 86400000).toISOString();
					// 70% anonymous, 30% authenticated
					const userId = Math.random() > 0.3 ? null : userIds[Math.floor(Math.random() * userIds.length)];

					values.push(`($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2}, $${paramIdx + 3})`);
					params.push(crypto.randomUUID(), resourceId, userId, downloadDate);
					paramIdx += 4;
				}

				await client.query(
					`INSERT INTO "downloads" (id, resource_id, user_id, created_at) VALUES ${values.join(",")}`,
					params,
				);
				totalDownloads += batch;
			}
		}
		log.log(`  + ${totalDownloads} descargas simuladas`);

		// ── 8. Insertar eventos de actividad ────────────────────────────────
		log.log("\nActividad reciente:\n");

		const activityEvents = [
			{ userId: "user-humberto", type: "resource_published", resId: "res-01", title: DEMO_RESOURCES[0]!.title, slug: DEMO_RESOURCES[0]!.slug, desc: "Publicó un nuevo recurso", daysAgo: 1 },
			{ userId: "user-carlos", type: "resource_published", resId: "res-02", title: DEMO_RESOURCES[1]!.title, slug: DEMO_RESOURCES[1]!.slug, desc: "Publicó un nuevo recurso", daysAgo: 2 },
			{ userId: "user-fran", type: "favorite_added", resId: "res-01", title: DEMO_RESOURCES[0]!.title, slug: DEMO_RESOURCES[0]!.slug, desc: "Añadió un recurso a favoritos", daysAgo: 3 },
			{ userId: "user-humberto", type: "rating_given", resId: "res-03", title: DEMO_RESOURCES[2]!.title, slug: DEMO_RESOURCES[2]!.slug, desc: "Valoró un recurso con 5 estrellas", daysAgo: 4 },
			{ userId: "user-carlos", type: "resource_published", resId: "res-11", title: DEMO_RESOURCES[10]!.title, slug: DEMO_RESOURCES[10]!.slug, desc: "Publicó un nuevo recurso", daysAgo: 5 },
			{ userId: "user-humberto2", type: "resource_published", resId: "res-20", title: DEMO_RESOURCES[19]!.title, slug: DEMO_RESOURCES[19]!.slug, desc: "Publicó un nuevo recurso", daysAgo: 6 },
			{ userId: "user-yanira", type: "favorite_added", resId: "res-07", title: DEMO_RESOURCES[6]!.title, slug: DEMO_RESOURCES[6]!.slug, desc: "Añadió un recurso a favoritos", daysAgo: 7 },
			{ userId: "user-carlos2", type: "resource_created", resId: "res-22", title: DEMO_RESOURCES[21]!.title, slug: DEMO_RESOURCES[21]!.slug, desc: "Creó un borrador", daysAgo: 1 },
			{ userId: "user-catedra", type: "resource_created", resId: "res-21", title: DEMO_RESOURCES[20]!.title, slug: DEMO_RESOURCES[20]!.slug, desc: "Creó un borrador", daysAgo: 2 },
			{ userId: "demo-admin", type: "resource_published", resId: "res-17", title: DEMO_RESOURCES[16]!.title, slug: DEMO_RESOURCES[16]!.slug, desc: "Publicó un nuevo recurso", daysAgo: 10 },
			{ userId: "user-fran", type: "resource_published", resId: "res-07", title: DEMO_RESOURCES[6]!.title, slug: DEMO_RESOURCES[6]!.slug, desc: "Publicó un nuevo recurso", daysAgo: 12 },
			{ userId: "user-carlos", type: "rating_given", resId: "res-01", title: DEMO_RESOURCES[0]!.title, slug: DEMO_RESOURCES[0]!.slug, desc: "Valoró un recurso con 5 estrellas", daysAgo: 8 },
			{ userId: "user-humberto2", type: "resource_published", resId: "res-15", title: DEMO_RESOURCES[14]!.title, slug: DEMO_RESOURCES[14]!.slug, desc: "Publicó un nuevo recurso", daysAgo: 15 },
			{ userId: "user-carlos2", type: "rating_given", resId: "res-07", title: DEMO_RESOURCES[6]!.title, slug: DEMO_RESOURCES[6]!.slug, desc: "Valoró un recurso con 5 estrellas", daysAgo: 9 },
			{ userId: "demo-curator", type: "favorite_added", resId: "res-01", title: DEMO_RESOURCES[0]!.title, slug: DEMO_RESOURCES[0]!.slug, desc: "Añadió un recurso a favoritos", daysAgo: 4 },
		];

		for (const evt of activityEvents) {
			const eventDate = new Date(Date.now() - evt.daysAgo * 86400000).toISOString();
			await client.query(
				`INSERT INTO "activity_events" (id, user_id, type, resource_id, resource_title, resource_slug, description, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
				[crypto.randomUUID(), evt.userId, evt.type, evt.resId, evt.title, evt.slug, evt.desc, eventDate],
			);
		}
		log.log(`  + ${activityEvents.length} eventos de actividad`);

	} finally {
		await client.close();
	}

	log.log(`\nSeed completado. ${options.successTarget}`);
}

// ---------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------

export async function seed() {
	if (resolveSeedMode() === "postgres") {
		await seedPostgres(process.env.DATABASE_URL!);
		return;
	}

	const { PGlite } = await import("@electric-sql/pglite");
	const { createTables } = await import("@procomeka/db/setup");

	const dataDir = process.env.PGLITE_DIR ?? `${import.meta.dir}/../../../../local-data`;
	const pglite = new PGlite(dataDir);
	await createTables(pglite);

	await seedWithClient(
		{
			query: (statement, params) => pglite.query(statement, params),
			close: () => pglite.close(),
		},
		{ successTarget: `Directorio PGlite: ${dataDir}` },
	);
}

async function seedPostgres(databaseUrl: string) {
	const postgres = (await import("postgres")).default;
	const { SCHEMA_STATEMENTS } = await import("@procomeka/db/setup");
	const sql = postgres(databaseUrl);
	const now = new Date().toISOString();

	for (const statement of SCHEMA_STATEMENTS) {
		await sql.unsafe(statement);
	}

	await seedWithClient(
		{
			query: (statement, params) => sql.unsafe(statement, params),
			close: () => sql.end(),
		},
		{ now, successTarget: formatPostgresSeedTarget(databaseUrl) },
	);
}
