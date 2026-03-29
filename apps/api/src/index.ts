import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth, getOidcProviders } from "./auth/config.ts";
import { type AuthEnv, sessionMiddleware } from "./auth/middleware.ts";
import { publicRoutes } from "./routes/public.ts";
import { adminRoutes } from "./routes/admin/index.ts";
import { devRoutes } from "./routes/dev.ts";
import { uploadRoutes } from "./routes/uploads.ts";
import { elpxContentRoutes } from "./routes/elpx-content.ts";
import { exelearningEditorRoutes } from "./routes/exelearning-editor.ts";
import { socialRoutes } from "./routes/social.ts";

const app = new Hono<AuthEnv>();

app.use(
	"/api/*",
	cors({
		origin: process.env.FRONTEND_URL ?? "http://localhost:4321",
		credentials: true,
	}),
);

// Better Auth handler
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Sesión en rutas admin y dev
app.use("/api/admin/*", sessionMiddleware);
app.use("/api/dev/*", sessionMiddleware);
app.use("/api/uploads/*", sessionMiddleware);

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/", (c) =>
	c.json({
		name: "Procomeka API",
		version: "0.1.0",
	}),
);

app.get("/api/v1/config", (c) => {
	const oidcProviders = getOidcProviders();
	return c.json({
		oidcEnabled: oidcProviders.length > 0,
		oidcProviders: oidcProviders.map((p) => ({
			id: p.providerId,
			name: p.name,
		})),
		// Keep for backward compatibility if needed, but the frontend should use oidcProviders
		oidcEndSessionUrl: process.env.OIDC_ISSUER
			? `${process.env.OIDC_ISSUER}/connect/endsession`
			: null,
	});
});

app.route("/api/v1", publicRoutes);
// Social routes need session context for user-specific data (userScore, userFavorited)
app.use("/api/v1/resources/*/ratings", sessionMiddleware);
app.use("/api/v1/resources/*/comments", sessionMiddleware);
app.use("/api/v1/resources/*/favorite", sessionMiddleware);
app.use("/api/v1/resources/*/download", sessionMiddleware);
app.use("/api/v1/resources/*/stats", sessionMiddleware);
app.use("/api/v1/users/*", sessionMiddleware);
app.use("/api/v1/comments/*", sessionMiddleware);
app.route("/api/v1", socialRoutes);
app.route("/api/v1/elpx", elpxContentRoutes);
app.route("/api/v1/exelearning-editor", exelearningEditorRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/dev", devRoutes);
app.route("/api/uploads", uploadRoutes);

export default {
	port: Number(process.env.PORT ?? 3000),
	fetch: app.fetch,
};

export { app };
