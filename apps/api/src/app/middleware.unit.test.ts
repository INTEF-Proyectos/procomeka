import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import type { AuthEnv } from "../auth/middleware.ts";
import { registerGlobalMiddleware } from "./middleware.ts";

describe("registerGlobalMiddleware", () => {
	test("applies CORS headers on API routes", async () => {
		const app = new Hono<AuthEnv>();
		registerGlobalMiddleware(app);
		app.get("/api/ping", (c) => c.json({ ok: true }));

		const response = await app.request("/api/ping", {
			headers: { Origin: "http://localhost:4321" },
		});

		expect(response.status).toBe(200);
		expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:4321");
		expect(response.headers.get("access-control-allow-credentials")).toBe("true");
	});
});
