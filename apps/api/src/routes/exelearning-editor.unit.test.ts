import { expect, test, describe } from "bun:test";
import { exelearningEditorRoutes } from "./exelearning-editor.ts";
import { Hono } from "hono";
import { existsSync } from "node:fs";
import path from "node:path";

const app = new Hono();
app.route("/api/v1/exelearning-editor", exelearningEditorRoutes);

const editorDir = path.resolve(import.meta.dir, "../../static/exelearning-editor/static");
const editorInstalled = existsSync(path.join(editorDir, "index.html"));

describe("GET /api/v1/exelearning-editor/index.html", () => {
	test("inyecta config de embedding cuando el editor existe", async () => {
		const res = await app.request(
			"/api/v1/exelearning-editor/index.html?elpxUrl=/test.elpx&resourceId=r1",
		);
		if (!editorInstalled) {
			expect(res.status).toBe(404);
			return;
		}
		expect(res.status).toBe(200);
		const html = await res.text();
		expect(html).toContain("__EXE_EMBEDDING_CONFIG__");
		expect(html).toContain("/test.elpx");
		expect(html).toContain("r1");
		expect(html).toContain("<base");
		expect(html).toContain("__PROCOMEKA_CONFIG__");
		expect(res.headers.get("content-type")).toContain("text/html");
		expect(res.headers.get("cache-control")).toBe("no-cache");
	});

	test("inyecta bridge script en el HTML", async () => {
		const res = await app.request("/api/v1/exelearning-editor/index.html");
		if (!editorInstalled) return;
		const html = await res.text();
		expect(html).toContain("WP_REQUEST_SAVE");
		expect(html).toContain("EXELEARNING_READY");
	});

	test("devuelve 404 si el editor no está descargado", async () => {
		if (editorInstalled) return; // skip when editor is present
		const res = await app.request("/api/v1/exelearning-editor/index.html");
		expect(res.status).toBe(404);
		expect(await res.text()).toContain("download-exelearning-editor");
	});
});

describe("GET /api/v1/exelearning-editor/* — static assets", () => {
	test("sirve archivo JS existente con MIME correcto", async () => {
		if (!editorInstalled) return;
		const res = await app.request("/api/v1/exelearning-editor/app/app.bundle.js");
		if (res.status === 200) {
			expect(res.headers.get("content-type")).toBe("application/javascript");
			expect(res.headers.get("cache-control")).toContain("public");
		}
	});

	test("sirve archivo CSS existente con MIME correcto", async () => {
		if (!editorInstalled) return;
		const res = await app.request("/api/v1/exelearning-editor/style/workarea/main.css");
		if (res.status === 200) {
			expect(res.headers.get("content-type")).toBe("text/css");
		}
	});

	test("devuelve 404 para path traversal", async () => {
		const res = await app.request("/api/v1/exelearning-editor/../../../etc/passwd");
		expect(res.status).toBe(404);
	});

	test("devuelve 404 para archivo inexistente", async () => {
		const res = await app.request("/api/v1/exelearning-editor/nonexistent.js");
		expect(res.status).toBe(404);
	});
});
