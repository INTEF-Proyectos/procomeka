import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import type { AuthEnv } from "./middleware.ts";
import { auditMiddleware } from "./audit.ts";

describe("auditMiddleware", () => {
	test("never breaks the response flow", async () => {
		const path = `/api/audit-test-${crypto.randomUUID()}`;
		const app = new Hono<AuthEnv>();

		app.use("*", async (c, next) => {
			c.set("user", null);
			c.set("session", null);
			await next();
		});
		app.use("/api/*", auditMiddleware);
		app.get(path, (c) => c.json({ ok: true }));

		const response = await app.request(path, {
			headers: {
				"user-agent": "bun-test",
				"x-real-ip": "127.0.0.1",
			},
		});

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ ok: true });
	});
});
