import { Hono } from "hono";
import { type AuthEnv } from "../../auth/middleware.ts";
import { getDb } from "../../db.ts";
import * as repo from "@procomeka/db/repository";

const settingsRoutes = new Hono<AuthEnv>();

// Only admin can read/write settings
function requireAdmin(c: { get: (key: string) => unknown }, next: () => Promise<void>) {
	const user = c.get("user") as { role?: string } | undefined;
	if (user?.role !== "admin") {
		return new Response(JSON.stringify({ error: "Acceso denegado" }), { status: 403, headers: { "content-type": "application/json" } });
	}
	return next();
}

settingsRoutes.use("*", requireAdmin as never);

settingsRoutes.get("/", async (c) => {
	const settings = await repo.getAllSettings(getDb().db);
	return c.json(settings);
});

settingsRoutes.put("/", async (c) => {
	const body = await c.req.json<Record<string, string>>();
	const entries = Object.entries(body).map(([key, value]) => ({ key, value: String(value) }));
	if (entries.length === 0) {
		return c.json({ error: "Se requiere al menos una configuración" }, 400);
	}
	await repo.upsertSettings(getDb().db, entries);
	const updated = await repo.getAllSettings(getDb().db);
	return c.json(updated);
});

export { settingsRoutes };
