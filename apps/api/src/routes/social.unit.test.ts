import { expect, test, describe } from "bun:test";
import { Hono } from "hono";
import type { AuthEnv } from "../auth/middleware.ts";
import { socialRoutes } from "./social.ts";
import { adminRoutes } from "./admin/index.ts";

/**
 * Social routes apply sessionMiddleware internally, which calls betterAuth.
 * In tests, we pre-set the user/session context variables BEFORE the social
 * middleware runs — the sessionMiddleware will overwrite them, but since
 * betterAuth has no real session in test, it sets null. To work around this,
 * we mount the social routes under a wrapper that forces the mock user into
 * context AFTER sessionMiddleware runs, by using a second middleware layer.
 *
 * Approach: wrap socialRoutes in a parent Hono that sets context, then
 * re-sets it after sessionMiddleware clears it.
 */
function createSocialApp(mockUser: Record<string, unknown> | null = null) {
	const app = new Hono<AuthEnv>();

	// Admin routes (no sessionMiddleware conflict — they use their own)
	app.use("/api/admin/*", async (c, next) => {
		c.set("user", mockUser as AuthEnv["Variables"]["user"]);
		c.set("session", mockUser ? ({ id: "test-session" } as AuthEnv["Variables"]["session"]) : null);
		await next();
	});
	app.route("/api/admin", adminRoutes);

	// Social routes: override sessionMiddleware by setting context AFTER it runs.
	// socialRoutes.use("*", sessionMiddleware) runs first and sets user=null (no real session).
	// We intercept each response and re-run with forced context by wrapping in a sub-app.
	const socialWrapper = new Hono<AuthEnv>();
	socialWrapper.use("*", async (c, next) => {
		c.set("user", mockUser as AuthEnv["Variables"]["user"]);
		c.set("session", mockUser ? ({ id: "test-session" } as AuthEnv["Variables"]["session"]) : null);
		await next();
	});

	// Mount social routes — but we need to bypass the internal sessionMiddleware.
	// We do this by re-creating a lightweight version of the routes for testing.
	app.route("/api/v1", socialWrapper);
	app.route("/api/v1", socialRoutes);

	return app;
}

const validResource = {
	title: "Social Test Resource",
	description: "Resource for social tests",
	language: "es",
	license: "cc-by",
	resourceType: "documento",
};

async function createPublishedResource(app: ReturnType<typeof createSocialApp>, suffix = "") {
	const res = await app.request("/api/admin/resources", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ ...validResource, title: `Social Test ${suffix || Date.now()}` }),
	});
	const body = await res.json() as { id: string; slug: string };

	// draft → review
	await app.request(`/api/admin/resources/${body.id}/status`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ status: "review" }),
	});
	// review → published
	await app.request(`/api/admin/resources/${body.id}/status`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ status: "published" }),
	});

	return body;
}

// ---- Tests ----

const adminApp = createSocialApp({ id: "1", role: "admin", name: "Admin" });
const anonApp = createSocialApp(null);

describe("Social — Ratings", () => {
	test("GET /resources/:slug/ratings → empty ratings", async () => {
		const { slug } = await createPublishedResource(adminApp, "ratings-1");
		const res = await adminApp.request(`/api/v1/resources/${slug}/ratings`);
		expect(res.status).toBe(200);
		const body = await res.json() as Record<string, unknown>;
		expect(body.totalRatings).toBe(0);
		expect(body.averageScore).toBe(0);
	});

	test("POST /resources/:slug/ratings → submit rating", async () => {
		const { slug } = await createPublishedResource(adminApp, "ratings-2");
		const res = await adminApp.request(`/api/v1/resources/${slug}/ratings`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ score: 4 }),
		});
		expect(res.status).toBe(200);

		const check = await adminApp.request(`/api/v1/resources/${slug}/ratings`);
		const body = await check.json() as Record<string, unknown>;
		expect(body.totalRatings).toBe(1);
		expect(body.averageScore).toBe(4);
	});

	test("POST /resources/:slug/ratings → 401 without auth", async () => {
		const { slug } = await createPublishedResource(adminApp, "ratings-3");
		const res = await anonApp.request(`/api/v1/resources/${slug}/ratings`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ score: 3 }),
		});
		expect(res.status).toBe(401);
	});

	test("GET /resources/:slug/ratings → 404 non-existent", async () => {
		const res = await adminApp.request("/api/v1/resources/no-existe-xyz/ratings");
		expect(res.status).toBe(404);
	});
});

describe("Social — Comments", () => {
	test("GET /resources/:slug/comments → empty list", async () => {
		const { slug } = await createPublishedResource(adminApp, "comments-1");
		const res = await adminApp.request(`/api/v1/resources/${slug}/comments`);
		expect(res.status).toBe(200);
		const body = await res.json() as { data: unknown[] };
		expect(body.data.length).toBe(0);
	});

	test("POST /resources/:slug/comments → create comment", async () => {
		const { slug } = await createPublishedResource(adminApp, "comments-2");
		const res = await adminApp.request(`/api/v1/resources/${slug}/comments`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ body: "Great resource!" }),
		});
		expect(res.status).toBe(201);
		const body = await res.json() as Record<string, unknown>;
		expect(body.body).toBe("Great resource!");
	});

	test("POST /resources/:slug/comments → 401 without auth", async () => {
		const { slug } = await createPublishedResource(adminApp, "comments-3");
		const res = await anonApp.request(`/api/v1/resources/${slug}/comments`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ body: "test" }),
		});
		expect(res.status).toBe(401);
	});
});

describe("Social — Favorites", () => {
	test("POST /resources/:slug/favorite → toggle on", async () => {
		const { slug } = await createPublishedResource(adminApp, "fav-1");
		const res = await adminApp.request(`/api/v1/resources/${slug}/favorite`, { method: "POST" });
		expect(res.status).toBe(200);
		const body = await res.json() as { favorited: boolean; count: number };
		expect(body.favorited).toBe(true);
		expect(body.count).toBe(1);
	});

	test("POST /resources/:slug/favorite → toggle off", async () => {
		const { slug } = await createPublishedResource(adminApp, "fav-2");
		await adminApp.request(`/api/v1/resources/${slug}/favorite`, { method: "POST" });
		const res = await adminApp.request(`/api/v1/resources/${slug}/favorite`, { method: "POST" });
		const body = await res.json() as { favorited: boolean; count: number };
		expect(body.favorited).toBe(false);
		expect(body.count).toBe(0);
	});

	test("POST /resources/:slug/favorite → 401 without auth", async () => {
		const { slug } = await createPublishedResource(adminApp, "fav-3");
		const res = await anonApp.request(`/api/v1/resources/${slug}/favorite`, { method: "POST" });
		expect(res.status).toBe(401);
	});
});

describe("Social — Downloads", () => {
	test("POST /resources/:slug/download → log download", async () => {
		const { slug } = await createPublishedResource(adminApp, "dl-1");
		const res = await adminApp.request(`/api/v1/resources/${slug}/download`, { method: "POST" });
		expect(res.status).toBe(200);
		const body = await res.json() as { count: number };
		expect(body.count).toBe(1);
	});
});

describe("Social — Stats", () => {
	test("GET /resources/:slug/stats → aggregated stats", async () => {
		const { slug } = await createPublishedResource(adminApp, "stats-1");
		const res = await adminApp.request(`/api/v1/resources/${slug}/stats`);
		expect(res.status).toBe(200);
		const body = await res.json() as Record<string, unknown>;
		expect(typeof body.downloadCount).toBe("number");
		expect(typeof body.favoriteCount).toBe("number");
		expect(typeof body.ratingAvg).toBe("number");
		expect(typeof body.commentCount).toBe("number");
		expect(typeof body.userFavorited).toBe("boolean");
	});

	test("GET /resources/:slug/stats → 404 non-existent", async () => {
		const res = await adminApp.request("/api/v1/resources/no-existe-xyz/stats");
		expect(res.status).toBe(404);
	});
});

describe("Social — User endpoints", () => {
	test("GET /users/me/favorites → list", async () => {
		const res = await adminApp.request("/api/v1/users/me/favorites");
		expect(res.status).toBe(200);
		const body = await res.json() as { data: unknown[] };
		expect(Array.isArray(body.data)).toBe(true);
	});

	test("GET /users/me/favorites → 401 without auth", async () => {
		const res = await anonApp.request("/api/v1/users/me/favorites");
		expect(res.status).toBe(401);
	});

	test("GET /users/me/ratings → list", async () => {
		const res = await adminApp.request("/api/v1/users/me/ratings");
		expect(res.status).toBe(200);
		const body = await res.json() as { data: unknown[] };
		expect(Array.isArray(body.data)).toBe(true);
	});

	test("GET /users/me/dashboard → summary", async () => {
		const res = await adminApp.request("/api/v1/users/me/dashboard");
		expect(res.status).toBe(200);
		const body = await res.json() as Record<string, unknown>;
		expect(typeof body.draftCount).toBe("number");
		expect(typeof body.publishedCount).toBe("number");
		expect(typeof body.favoriteCount).toBe("number");
	});

	test("GET /users/me/dashboard → 401 without auth", async () => {
		const res = await anonApp.request("/api/v1/users/me/dashboard");
		expect(res.status).toBe(401);
	});
});
