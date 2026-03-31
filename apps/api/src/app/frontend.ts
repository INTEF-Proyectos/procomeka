import type { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { type AuthEnv } from "../auth/middleware.ts";

export function registerFrontendServing(app: Hono<AuthEnv>, frontendDir?: string) {
	if (!frontendDir) {
		app.get("/", (c) =>
			c.json({
				name: "Procomeka API",
				version: "0.1.0",
			}),
		);
		return;
	}

	app.use(
		"*",
		serveStatic({
			root: frontendDir,
			onNotFound: () => {},
		}),
	);
	app.get("*", serveStatic({ root: frontendDir, path: "/index.html" }));
}
