import { describe, expect, test } from "bun:test";
import { getOidcProviders } from "./config.ts";

import {
	DEFAULT_FRONTEND_URL,
	getAuthBaseUrl,
	getFrontendUrl,
} from "./urls.ts";

describe("auth config helpers", () => {
	test("use frontend URL as canonical local default", () => {
		expect(getFrontendUrl({} as NodeJS.ProcessEnv)).toBe(DEFAULT_FRONTEND_URL);
		expect(getAuthBaseUrl({} as NodeJS.ProcessEnv)).toBe(DEFAULT_FRONTEND_URL);
	});

	test("prefer explicit BETTER_AUTH_URL over frontend URL", () => {
		expect(
			getAuthBaseUrl({
				BETTER_AUTH_URL: "https://catalogo.ejemplo.test",
				FRONTEND_URL: "http://localhost:4321",
			} as NodeJS.ProcessEnv),
		).toBe("https://catalogo.ejemplo.test");
	});

	test("keep explicit FRONTEND_URL for trusted origins and auth fallback", () => {
		const env = {
			FRONTEND_URL: "https://staging.procomeka.test",
		} as NodeJS.ProcessEnv;

		expect(getFrontendUrl(env)).toBe("https://staging.procomeka.test");
		expect(getAuthBaseUrl(env)).toBe("https://staging.procomeka.test");
	});

	test("parse multiple OIDC providers from OIDC_PROVIDERS env", () => {
		const providers = [
			{
				id: "educa-madrid",
				name: "EducaMadrid",
				clientId: "client1",
				clientSecret: "secret1",
				issuer: "https://auth.educa.madrid.org",
			},
			{
				id: "google-edu",
				name: "Google Workspace for Education",
				clientId: "client2",
				clientSecret: "secret2",
				discoveryUrl: "https://accounts.google.com/.well-known/openid-configuration",
			},
		];

		const oldEnv = process.env.OIDC_PROVIDERS;
		process.env.OIDC_PROVIDERS = JSON.stringify(providers);
		try {
			const parsed = getOidcProviders();
			expect(parsed).toHaveLength(2);
			expect(parsed[0].providerId).toBe("educa-madrid");
			expect(parsed[0].name).toBe("EducaMadrid");
			expect(parsed[0].discoveryUrl).toBe("https://auth.educa.madrid.org/.well-known/openid-configuration");
			expect(parsed[1].providerId).toBe("google-edu");
			expect(parsed[1].name).toBe("Google Workspace for Education");
			expect(parsed[1].discoveryUrl).toBe("https://accounts.google.com/.well-known/openid-configuration");
		} finally {
			process.env.OIDC_PROVIDERS = oldEnv;
		}
	});

	test("fallback to legacy single OIDC provider if OIDC_PROVIDERS is not set", () => {
		const oldProviders = process.env.OIDC_PROVIDERS;
		const oldEnabled = process.env.OIDC_ENABLED;
		const oldIssuer = process.env.OIDC_ISSUER;
		const oldClientId = process.env.OIDC_CLIENT_ID;
		const oldClientSecret = process.env.OIDC_CLIENT_SECRET;

		process.env.OIDC_PROVIDERS = "";
		process.env.OIDC_ENABLED = "true";
		process.env.OIDC_ISSUER = "https://demo.example.com";
		process.env.OIDC_CLIENT_ID = "test-client";
		process.env.OIDC_CLIENT_SECRET = "test-secret";

		try {
			const parsed = getOidcProviders();
			expect(parsed).toHaveLength(1);
			expect(parsed[0].providerId).toBe("oidc");
			expect(parsed[0].name).toBe("Institucional");
			expect(parsed[0].clientId).toBe("test-client");
		} finally {
			process.env.OIDC_PROVIDERS = oldProviders;
			process.env.OIDC_ENABLED = oldEnabled;
			process.env.OIDC_ISSUER = oldIssuer;
			process.env.OIDC_CLIENT_ID = oldClientId;
			process.env.OIDC_CLIENT_SECRET = oldClientSecret;
		}
	});
});
