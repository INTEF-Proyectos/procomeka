import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { Hono } from "hono";
import { auditMiddleware } from "./auth/audit.ts";
import { auth } from "./auth/config.ts";
import { type AuthEnv, sessionMiddleware } from "./auth/middleware.ts";
import { adminRoutes } from "./routes/admin/index.ts";
import { devRoutes } from "./routes/dev.ts";
import { elpxContentRoutes } from "./routes/elpx-content.ts";
import { exelearningEditorRoutes } from "./routes/exelearning-editor.ts";
import { publicRoutes } from "./routes/public.ts";
import { socialRoutes } from "./routes/social.ts";
import { uploadRoutes } from "./routes/uploads.ts";

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

function registerGlobalMiddleware(app: Hono<AuthEnv>) {
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

function registerRoutes(app: Hono<AuthEnv>) {
	app.get("/health", (c) => c.json({ status: "ok" }));
	app.get("/api/v1/config", (c) =>
		c.json({
			oidcEnabled: process.env.OIDC_ENABLED === "true",
			oidcEndSessionUrl: process.env.OIDC_ISSUER
				? `${process.env.OIDC_ISSUER}/connect/endsession`
				: null,
		}),
	);

	app.route("/api/v1", publicRoutes);
	app.route("/api/v1", socialRoutes);
	app.route("/api/v1/elpx", elpxContentRoutes);
	app.route("/api/v1/exelearning-editor", exelearningEditorRoutes);
	app.route("/api/admin", adminRoutes);
	app.route("/api/dev", devRoutes);
	app.route("/api/uploads", uploadRoutes);
}

function registerFrontendServing(app: Hono<AuthEnv>, frontendDir?: string) {
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

export function createApp(frontendDir = process.env.SERVE_FRONTEND) {
	const app = new Hono<AuthEnv>();
	registerGlobalMiddleware(app);
	registerRoutes(app);
	registerFrontendServing(app, frontendDir);
	return app;
}
