import type { Context } from "hono";

export function parsePagination(c: Context) {
	const limit = Math.min(Math.max(Number(c.req.query("limit") ?? "20") || 20, 1), 100);
	const offset = Math.max(Number(c.req.query("offset") ?? "0") || 0, 0);
	const search = c.req.query("q") ?? undefined;
	return { limit, offset, search };
}
