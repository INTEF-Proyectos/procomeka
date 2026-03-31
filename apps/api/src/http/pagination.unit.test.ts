import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { parsePagination } from "./pagination.ts";

describe("parsePagination", () => {
	test("uses defaults when query params are missing", async () => {
		const app = new Hono().get("/", (c) => c.json(parsePagination(c)));
		const response = await app.request("/");

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			limit: 20,
			offset: 0,
		});
	});

	test("normalizes limit, offset and search query", async () => {
		const app = new Hono().get("/", (c) => c.json(parsePagination(c)));
		const response = await app.request("/?limit=250&offset=-5&q=matematicas");

		expect(await response.json()).toEqual({
			limit: 100,
			offset: 0,
			search: "matematicas",
		});
	});
});
