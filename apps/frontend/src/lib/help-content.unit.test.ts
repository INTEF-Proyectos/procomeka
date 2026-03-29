import { describe, expect, test } from "bun:test";
import { HELP_FOOTER_LINKS, HELP_SECTIONS, buildHelpHref } from "./help-content.ts";

describe("help content", () => {
	test("define las secciones de ayuda clave para la navegacion y soporte", () => {
		const ids = HELP_SECTIONS.map((section) => section.id);
		expect(ids).toEqual([
			"primeros-pasos",
			"explorar-recursos",
			"publicar-recurso",
			"colecciones",
			"faq",
			"roles-permisos",
			"contacto",
			"mapa-web",
		]);
	});

	test("construye enlaces con y sin ancla", () => {
		expect(buildHelpHref()).toBe("ayuda");
		expect(buildHelpHref("faq")).toBe("ayuda#faq");
	});

	test("expone los enlaces del footer a secciones reales", () => {
		expect(HELP_FOOTER_LINKS).toEqual([
			{ label: "Contacto", sectionId: "contacto" },
			{ label: "Mapa Web", sectionId: "mapa-web" },
			{ label: "Preguntas Frecuentes", sectionId: "faq" },
		]);
	});
});
