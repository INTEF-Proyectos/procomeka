import { Hono } from "hono";
import { type AuthEnv, requireAuth } from "../../auth/middleware.ts";
import { resourceRoutes, adminUploadRoutes } from "./resources.ts";
import { userRoutes } from "./users.ts";
import { collectionRoutes } from "./collections.ts";
import { taxonomyRoutes } from "./taxonomies.ts";
import { elpxAdminRoutes } from "./elpx.ts";
import { settingsRoutes } from "./settings.ts";

const adminRoutes = new Hono<AuthEnv>();

adminRoutes.use("*", requireAuth);

adminRoutes.route("/resources", resourceRoutes);
adminRoutes.route("/users", userRoutes);
adminRoutes.route("/collections", collectionRoutes);
adminRoutes.route("/taxonomies", taxonomyRoutes);
adminRoutes.route("/uploads", adminUploadRoutes);
adminRoutes.route("/elpx", elpxAdminRoutes);
adminRoutes.route("/settings", settingsRoutes);

export { adminRoutes };
