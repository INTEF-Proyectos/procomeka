import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PublicCollectionsIsland } from "./PublicCollectionsIsland.tsx";

describe("PublicCollectionsIsland", () => {
	test("renderiza el shell inicial de colecciones públicas", () => {
		const html = renderToStaticMarkup(<PublicCollectionsIsland />);

		expect(html).toContain("Colecciones publicadas");
		expect(html).toContain("Buscar por título o descripción");
		expect(html).toContain("Cargando colecciones...");
	});
});
