import { Hono } from "hono";
import { registerFrontendServing } from "./app/frontend.ts";
import { registerGlobalMiddleware } from "./app/middleware.ts";
import { registerRoutes } from "./app/routes.ts";
import { type AuthEnv } from "./auth/middleware.ts";

export function createApp(frontendDir = process.env.SERVE_FRONTEND) {
	const app = new Hono<AuthEnv>();
	registerGlobalMiddleware(app);
	registerRoutes(app);
	registerFrontendServing(app, frontendDir);
	return app;
}
