import { describe, expect, test } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Hono } from "hono";
import { registerFrontendServing } from "./frontend.ts";
import type { AuthEnv } from "../auth/middleware.ts";

describe("registerFrontendServing", () => {
	test("returns API metadata when no frontend directory is configured", async () => {
		const app = new Hono<AuthEnv>();
		registerFrontendServing(app);

		const response = await app.request("/");
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			name: "Procomeka API",
			version: "0.1.0",
		});
	});

	test("serves the frontend index when a static directory is provided", async () => {
		const frontendDir = await mkdtemp(path.join(tmpdir(), "procomeka-frontend-"));
		await writeFile(path.join(frontendDir, "index.html"), "<html><body>frontend ok</body></html>");

		const app = new Hono<AuthEnv>();
		registerFrontendServing(app, frontendDir);

		const response = await app.request("/cualquier/ruta");
		expect(response.status).toBe(200);
		expect(await response.text()).toContain("frontend ok");
	});
});
