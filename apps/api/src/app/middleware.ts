import { cors } from "hono/cors";
import type { Hono } from "hono";
import { auditMiddleware } from "../auth/audit.ts";
import { auth } from "../auth/config.ts";
import { type AuthEnv, sessionMiddleware } from "../auth/middleware.ts";

const sessionProtectedApiPatterns = [
	"/api/admin/*",
	"/api/dev/*",
	"/api/uploads/*",
];

const sessionProtectedSocialPatterns = [
	"/api/v1/resources/*/ratings",
	"/api/v1/resources/*/comments",
	"/api/v1/resources/*/favorite",
	"/api/v1/resources/*/download",
	"/api/v1/resources/*/stats",
	"/api/v1/users/*",
	"/api/v1/comments/*",
];

export function registerGlobalMiddleware(app: Hono<AuthEnv>) {
	app.use(
		"/api/*",
		cors({
			origin: process.env.FRONTEND_URL ?? "http://localhost:4321",
			credentials: true,
		}),
	);
	app.use("/api/*", auditMiddleware);
	app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

	for (const pattern of sessionProtectedApiPatterns) {
		app.use(pattern, sessionMiddleware);
	}

	for (const pattern of sessionProtectedSocialPatterns) {
		app.use(pattern, sessionMiddleware);
	}
}
