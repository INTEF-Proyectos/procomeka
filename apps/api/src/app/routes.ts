import type { Hono } from "hono";
import { type AuthEnv } from "../auth/middleware.ts";
import { adminRoutes } from "../routes/admin/index.ts";
import { devRoutes } from "../routes/dev.ts";
import { elpxContentRoutes } from "../routes/elpx-content.ts";
import { exelearningEditorRoutes } from "../routes/exelearning-editor.ts";
import { publicRoutes } from "../routes/public.ts";
import { socialRoutes } from "../routes/social.ts";
import { uploadRoutes } from "../routes/uploads.ts";

export function registerRoutes(app: Hono<AuthEnv>) {
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
