/**
 * Instancia Drizzle compartida.
 * SQLite en dev (sin DATABASE_URL), PostgreSQL en prod (con DATABASE_URL).
 */

let _db: ReturnType<typeof createDb> | null = null;

function createDb() {
	if (process.env.DATABASE_URL) {
		const { drizzle } = require("drizzle-orm/bun-sql");
		const pgSchema = require("@procomeka/db/schema");
		return { db: drizzle(process.env.DATABASE_URL, { schema: pgSchema }), provider: "pg" as const };
	}

	const { drizzle } = require("drizzle-orm/bun-sqlite");
	const { Database } = require("bun:sqlite");
	const dbPath = process.env.DB_PATH ?? `${import.meta.dir}/../../../local.db`;
	const sqlite = new Database(dbPath, { create: true });
	const sqliteSchema = {
		...require("../../../packages/db/src/schema/auth-sqlite.ts"),
		...require("../../../packages/db/src/schema/resources-sqlite.ts"),
	};
	return { db: drizzle(sqlite, { schema: sqliteSchema }), provider: "sqlite" as const };
}

export function getDb() {
	if (!_db) _db = createDb();
	return _db;
}
