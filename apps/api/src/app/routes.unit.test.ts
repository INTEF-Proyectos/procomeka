import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import type { AuthEnv } from "../auth/middleware.ts";
import { registerRoutes } from "./routes.ts";

describe("registerRoutes", () => {
	test("registers health and config endpoints", async () => {
		const app = new Hono<AuthEnv>();
		registerRoutes(app);

		const healthResponse = await app.request("/health");
		expect(healthResponse.status).toBe(200);
		expect(await healthResponse.json()).toEqual({ status: "ok" });

		const configResponse = await app.request("/api/v1/config");
		expect(configResponse.status).toBe(200);
		const config = await configResponse.json();
		expect(typeof config.oidcEnabled).toBe("boolean");
		expect("oidcEndSessionUrl" in config).toBe(true);
	});
});
