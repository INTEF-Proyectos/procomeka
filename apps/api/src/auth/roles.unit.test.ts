import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import type { AuthEnv } from "./middleware.ts";
import { canManageCollection, canManageResource, getCurrentUser, hasMinRole } from "./roles.ts";

describe("auth roles helpers", () => {
	test("getCurrentUser reads the user from context", async () => {
		const app = new Hono<AuthEnv>();
		app.use("*", async (c, next) => {
			c.set("user", { id: "user-1", role: "author" } as AuthEnv["Variables"]["user"]);
			c.set("session", null);
			await next();
		});
		app.get("/", (c) => c.json(getCurrentUser(c)));

		const response = await app.request("/");
		expect(await response.json()).toEqual({ id: "user-1", role: "author" });
	});

	test("hasMinRole respects the role hierarchy", () => {
		expect(hasMinRole("admin", "curator")).toBe(true);
		expect(hasMinRole("author", "curator")).toBe(false);
		expect(hasMinRole(undefined, "reader")).toBe(true);
	});

	test("canManageResource validates owner and curator/admin access", () => {
		expect(
			canManageResource(
				{ id: "author-1", role: "author" },
				{ createdBy: "author-1", assignedCuratorId: null },
			),
		).toBe(true);
		expect(
			canManageResource(
				{ id: "curator-1", role: "curator" },
				{ createdBy: "author-1", assignedCuratorId: "curator-1" },
			),
		).toBe(true);
		expect(
			canManageResource(
				{ id: "reader-1", role: "reader" },
				{ createdBy: "author-1", assignedCuratorId: "curator-1" },
			),
		).toBe(false);
	});

	test("canManageCollection validates curator and admin access", () => {
		expect(
			canManageCollection(
				{ id: "curator-1", role: "curator" },
				{ curatorId: "curator-1" },
			),
		).toBe(true);
		expect(
			canManageCollection(
				{ id: "admin-1", role: "admin" },
				{ curatorId: "curator-2" },
			),
		).toBe(true);
		expect(
			canManageCollection(
				{ id: "author-1", role: "author" },
				{ curatorId: "curator-1" },
			),
		).toBe(false);
	});
});
