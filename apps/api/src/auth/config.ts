import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin } from "better-auth/plugins";
import { genericOAuth } from "better-auth/plugins";
import {
	ac,
	admin,
	author,
	curator,
	reader,
} from "./permissions.ts";
import * as pgSchema from "@procomeka/db/schema";
import { getDb } from "../db.ts";
import { getAuthBaseUrl, getFrontendUrl } from "./urls.ts";
import { logActivity } from "../helpers.ts";

const frontendUrl = getFrontendUrl();
const oidcEnabled = process.env.OIDC_ENABLED === "true";

export const auth = betterAuth({
	baseURL: getAuthBaseUrl(),
	trustedOrigins: [frontendUrl],
	database: drizzleAdapter(getDb().db, { provider: "pg", schema: pgSchema }),
	basePath: "/api/auth",
	databaseHooks: {
		session: {
			create: {
				after: async (session) => {
					await logActivity({
						userId: session.userId,
						type: "auth_login",
						description: "Inicio de sesión exitoso",
						metadata: { sessionId: session.id },
					});
				},
			},
		},
	},
	hooks: {
		after: async (ctx) => {
			if (ctx.path === "/sign-out") {
				const session = ctx.context.session;
				if (session) {
					await logActivity({
						userId: session.userId,
						type: "auth_logout",
						description: "Cierre de sesión",
						metadata: { sessionId: session.id },
					});
				}
			}
		},
	},
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
	},
	plugins: [
		adminPlugin({
			ac,
			roles: {
				admin,
				curator,
				author,
				reader,
			},
			defaultRole: "reader",
		}),
		...(oidcEnabled
			? [
					genericOAuth({
						config: [
							{
								providerId: "oidc",
								clientId: process.env.OIDC_CLIENT_ID ?? "",
								clientSecret: process.env.OIDC_CLIENT_SECRET ?? "",
								discoveryUrl: process.env.OIDC_ISSUER
									? `${process.env.OIDC_ISSUER}/.well-known/openid-configuration`
									: "",
								scopes: (process.env.OIDC_SCOPE ?? "openid email profile").split(" "),
								pkce: true,
							},
						],
					}),
				]
			: []),
	],
});

export type Auth = typeof auth;
