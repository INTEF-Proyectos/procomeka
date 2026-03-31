import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PublicNavIsland } from "./PublicNavIsland.tsx";
import { BaseNavIsland } from "./BaseNavIsland.tsx";
import { PreviewBannerIsland } from "./PreviewBannerIsland.tsx";

describe("Layout islands", () => {
	test("BaseNavIsland renderiza el shell de navegación pública", () => {
		const html = renderToStaticMarkup(<BaseNavIsland />);

		expect(html).toContain("Crear recurso");
		expect(html).toContain("Iniciar sesion");
	});

	test("PublicNavIsland mantiene visible el acceso a ayuda", () => {
		const html = renderToStaticMarkup(<PublicNavIsland />);

		expect(html).toContain("Ayuda");
		expect(html).toContain("help");
	});

	test("PreviewBannerIsland renderiza el shell de preview", () => {
		const html = renderToStaticMarkup(<PreviewBannerIsland />);

		expect(html).toContain("Vista previa");
		expect(html).toContain("Reiniciar datos");
	});
});
