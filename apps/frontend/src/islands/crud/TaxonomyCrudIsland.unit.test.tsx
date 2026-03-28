import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { TaxonomyCrudIsland } from "./TaxonomyCrudIsland.tsx";
import { CrudTable } from "./CrudTable.tsx";
import { ConfirmDialog } from "../shared/ConfirmDialog.tsx";

describe("React islands CRUD pilot", () => {
	test("TaxonomyCrudIsland renderiza el shell inicial del piloto", () => {
		const html = renderToStaticMarkup(<TaxonomyCrudIsland />);

		expect(html).toContain("Nueva categoria");
		expect(html).toContain("Cargando categorias...");
		expect(html).toContain("Nombre o slug");
		expect(html).toContain("Crear categoria");
		expect(html).toContain("No hay categorias para los filtros actuales.");
	});

	test("CrudTable renderiza estado vacio accesible", () => {
		const html = renderToStaticMarkup(
			<CrudTable
				columns={[
					{ id: "name", header: "Nombre", cell: (row: { name: string }) => row.name },
				]}
				rows={[]}
				getRowKey={(row) => row.name}
				emptyMessage="Sin resultados"
			/>,
		);

		expect(html).toContain("<table>");
		expect(html).toContain("Sin resultados");
	});

	test("ConfirmDialog abierto incluye el mensaje de borrado", () => {
		const html = renderToStaticMarkup(
			<ConfirmDialog
				open
				title="Eliminar categoria"
				message='Seguro que deseas eliminar "Matematicas"?'
				confirmLabel="Eliminar"
				onCancel={() => {}}
				onConfirm={() => {}}
			/>,
		);

		expect(html).toContain('Seguro que deseas eliminar &quot;Matematicas&quot;?');
		expect(html).toContain("confirm-dialog-title");
		expect(html).toContain("Eliminar categoria");
	});
});
