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

const frontendUrl = getFrontendUrl();

export interface OidcProviderConfig {
	providerId: string;
	name: string;
	clientId: string;
	clientSecret: string;
	discoveryUrl?: string;
	issuer?: string;
	scopes?: string[];
	pkce?: boolean;
	endSessionUrl?: string;
}

export function getOidcProviders(): OidcProviderConfig[] {
	const providersJson = process.env.OIDC_PROVIDERS;
	if (providersJson) {
		try {
			const providers = JSON.parse(providersJson);
			if (Array.isArray(providers)) {
				return providers.map((p) => ({
					providerId: p.id || p.providerId,
					name: p.name || p.id || p.providerId,
					clientId: p.clientId,
					clientSecret: p.clientSecret,
					discoveryUrl:
						p.discoveryUrl ||
						(p.issuer ? `${p.issuer}/.well-known/openid-configuration` : undefined),
					issuer: p.issuer,
					scopes: p.scopes || ["openid", "email", "profile"],
					pkce: p.pkce ?? true,
					endSessionUrl: p.endSessionUrl,
				}));
			}
		} catch (e) {
			console.error("Error parsing OIDC_PROVIDERS:", e);
		}
	}

	// Fallback to legacy single OIDC provider
	if (process.env.OIDC_ENABLED === "true") {
		return [
			{
				providerId: "oidc",
				name: "Institucional",
				clientId: process.env.OIDC_CLIENT_ID ?? "",
				clientSecret: process.env.OIDC_CLIENT_SECRET ?? "",
				discoveryUrl: process.env.OIDC_ISSUER
					? `${process.env.OIDC_ISSUER}/.well-known/openid-configuration`
					: undefined,
				scopes: (process.env.OIDC_SCOPE ?? "openid email profile").split(" "),
				pkce: true,
				endSessionUrl: process.env.OIDC_ISSUER
					? `${process.env.OIDC_ISSUER}/connect/endsession`
					: undefined,
			},
		];
	}

	return [];
}

const oidcProviders = getOidcProviders();

export const auth = betterAuth({
	baseURL: getAuthBaseUrl(),
	trustedOrigins: [frontendUrl],
	database: drizzleAdapter(getDb().db, { provider: "pg", schema: pgSchema }),
	basePath: "/api/auth",
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
	},
	user: {
		additionalFields: {
			lastProviderId: {
				type: "string",
				required: false,
				input: false,
			},
		},
	},
	account: {
		accountLinking: {
			enabled: true,
		},
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
		...(oidcProviders.length > 0
			? [
					genericOAuth({
						config: oidcProviders.map((p) => ({
							providerId: p.providerId,
							clientId: p.clientId,
							clientSecret: p.clientSecret,
							discoveryUrl: p.discoveryUrl,
							issuer: p.issuer,
							scopes: p.scopes,
							pkce: p.pkce,
							mapProfileToUser: async () => {
								return {
									lastProviderId: p.providerId,
								};
							},
						})),
					}),
				]
			: []),
	],
});

export type Auth = typeof auth;
