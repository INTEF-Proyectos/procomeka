import { describe, expect, test } from "bun:test";
import { buildCrudRoutes } from "./crud-builder.ts";
import { Hono } from "hono";
import type { AuthEnv } from "../auth/middleware.ts";

describe("buildCrudRoutes", () => {
	test("applies list filters and pagination on the collection route", async () => {
		const listCalls: Record<string, unknown>[] = [];
		const routes = buildCrudRoutes({
			baseRole: "author",
			list: async (_db, opts) => {
				listCalls.push(opts);
				return { data: [], total: 0 };
			},
			getById: async () => null,
			listFilters: (_user, params) => ({ language: params.language }),
		});

		const app = new Hono<AuthEnv>();
		app.use("*", async (c, next) => {
			c.set("user", { id: "author-1", role: "author" } as AuthEnv["Variables"]["user"]);
			c.set("session", null);
			await next();
		});
		app.route("/crud", routes);

		const response = await app.request("/crud?limit=5&offset=3&q=matematicas&language=es");
		expect(response.status).toBe(200);
		expect(listCalls).toEqual([
			{
				limit: 5,
				offset: 3,
				search: "matematicas",
				language: "es",
			},
		]);
	});

	test("returns 404 when updating a missing entity", async () => {
		const routes = buildCrudRoutes({
			baseRole: "author",
			list: async () => ({ data: [], total: 0 }),
			getById: async () => null,
			update: async () => {},
		});

		const app = new Hono<AuthEnv>();
		app.use("*", async (c, next) => {
			c.set("user", { id: "author-1", role: "author" } as AuthEnv["Variables"]["user"]);
			c.set("session", null);
			await next();
		});
		app.route("/crud", routes);

		const response = await app.request("/crud/missing", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title: "nuevo" }),
		});

		expect(response.status).toBe(404);
		expect(await response.json()).toEqual({ error: "No encontrado" });
	});
});
