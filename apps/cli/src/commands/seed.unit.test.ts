import { describe, expect, test } from "bun:test";
import { DEMO_USERS, DEMO_RESOURCES, DEMO_COLLECTIONS, DEMO_RATINGS, DEMO_FAVORITES } from "@procomeka/db/seed-data";
import { formatPostgresSeedTarget, resolveSeedMode, seedWithClient } from "./seed.ts";

describe("resolveSeedMode", () => {
	test("usa postgres si DATABASE_URL está definida", () => {
		expect(resolveSeedMode({ DATABASE_URL: "postgres://localhost/db" })).toBe("postgres");
	});

	test("usa pglite si DATABASE_URL no está definida", () => {
		expect(resolveSeedMode({})).toBe("pglite");
	});
});

describe("formatPostgresSeedTarget", () => {
	test("redacta credenciales y conserva host, puerto y base de datos", () => {
		expect(formatPostgresSeedTarget("postgres://user:secret@db.example.com:6543/procomeka")).toBe(
			"Base PostgreSQL: db.example.com:6543/procomeka",
		);
	});
});

describe("seedWithClient", { timeout: 60_000 }, () => {
	test("ejecuta delete+insert idempotente para todas las entidades", { timeout: 30_000 }, async () => {
		const calls: Array<{ statement: string; params?: unknown[] }> = [];
		const logs: string[] = [];
		let closed = false;

		await seedWithClient(
			{
				async query(statement, params) {
					calls.push({ statement, params });
					return { rows: [] };
				},
				async close() {
					closed = true;
				},
			},
			{
				now: "2026-03-27T10:00:00.000Z",
				log: { log: (message: string) => logs.push(message) },
				successTarget: "Directorio PGlite: /tmp/procomeka",
			},
		);

		expect(closed).toBe(true);

		// Verifica limpieza previa (DELETE)
		expect(calls.some((c) => c.statement.includes('DELETE FROM "user"'))).toBe(true);
		expect(calls.some((c) => c.statement.includes('DELETE FROM "resources"'))).toBe(true);
		expect(calls.some((c) => c.statement.includes('DELETE FROM "collections"'))).toBe(true);
		expect(calls.some((c) => c.statement.includes('DELETE FROM "ratings"'))).toBe(true);
		expect(calls.some((c) => c.statement.includes('DELETE FROM "favorites"'))).toBe(true);
		expect(calls.some((c) => c.statement.includes('DELETE FROM "downloads"'))).toBe(true);

		// Verifica inserciones
		expect(calls.filter((c) => c.statement.includes('INSERT INTO "user"')).length).toBe(DEMO_USERS.length);
		expect(calls.filter((c) => c.statement.includes('INSERT INTO "account"')).length).toBe(DEMO_USERS.length);
		expect(calls.filter((c) => c.statement.includes('INSERT INTO "resources"')).length).toBe(DEMO_RESOURCES.length);
		expect(calls.some((c) => c.statement.includes('INSERT INTO "resource_subjects"'))).toBe(true);
		expect(calls.some((c) => c.statement.includes('INSERT INTO "resource_levels"'))).toBe(true);
		expect(calls.filter((c) => c.statement.includes('INSERT INTO "collections" ')).length).toBe(DEMO_COLLECTIONS.length);
		expect(calls.some((c) => c.statement.includes('INSERT INTO "collection_resources"'))).toBe(true);
		expect(calls.filter((c) => c.statement.includes('INSERT INTO "ratings"')).length).toBe(DEMO_RATINGS.length);
		expect(calls.filter((c) => c.statement.includes('INSERT INTO "favorites"')).length).toBe(DEMO_FAVORITES.length);
		expect(calls.some((c) => c.statement.includes('INSERT INTO "downloads"'))).toBe(true);
		expect(calls.some((c) => c.statement.includes('INSERT INTO "activity_events"'))).toBe(true);

		// Verifica mensaje final
		expect(logs.at(-1)).toBe("\nSeed completado. Directorio PGlite: /tmp/procomeka");
	});

	test("cierra el cliente aunque falle una consulta", async () => {
		let closed = false;

		await expect(
			seedWithClient(
				{
					async query(statement) {
						if (statement.includes('INSERT INTO "account"')) {
							throw new Error("account insert failed");
						}
						return { rows: [] };
					},
					async close() {
						closed = true;
					},
				},
				{ successTarget: "Directorio PGlite: /tmp/procomeka" },
			),
		).rejects.toThrow("account insert failed");

		expect(closed).toBe(true);
	});
});
