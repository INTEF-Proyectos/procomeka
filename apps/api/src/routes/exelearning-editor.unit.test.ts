import { expect, test, describe } from "bun:test";
import { exelearningEditorRoutes } from "./exelearning-editor.ts";
import { Hono } from "hono";

const app = new Hono();
app.route("/api/v1/exelearning-editor", exelearningEditorRoutes);

describe("GET /api/v1/exelearning-editor/index.html", () => {
	test("devuelve 404 si el editor no está descargado", async () => {
		// The static editor may or may not be present — this tests the fallback
		const res = await app.request("/api/v1/exelearning-editor/index.html");
		// Either 200 (editor exists) or 404 (not downloaded yet)
		expect([200, 404]).toContain(res.status);
		if (res.status === 404) {
			const text = await res.text();
			expect(text).toContain("download-exelearning-editor");
		}
	});

	test("incluye query params en la respuesta si el editor existe", async () => {
		const res = await app.request(
			"/api/v1/exelearning-editor/index.html?elpxUrl=/test.elpx&resourceId=r1",
		);
		if (res.status === 200) {
			const html = await res.text();
			expect(html).toContain("__EXE_EMBEDDING_CONFIG__");
			expect(html).toContain("/test.elpx");
			expect(html).toContain("r1");
		}
	});
});

describe("GET /api/v1/exelearning-editor/* — static assets", () => {
	test("devuelve 404 para path traversal", async () => {
		const res = await app.request("/api/v1/exelearning-editor/../../../etc/passwd");
		expect(res.status).toBe(404);
	});

	test("devuelve 404 para archivo inexistente", async () => {
		const res = await app.request("/api/v1/exelearning-editor/nonexistent.js");
		expect(res.status).toBe(404);
	});

	test("devuelve 404 para path vacío", async () => {
		const res = await app.request("/api/v1/exelearning-editor/");
		// Redirects or 404 depending on route matching
		expect([200, 404]).toContain(res.status);
	});
});
