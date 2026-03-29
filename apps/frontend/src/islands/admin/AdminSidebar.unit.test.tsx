import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AdminSidebar } from "./AdminSidebar.tsx";

describe("AdminSidebar", () => {
	test("expone ayuda contextual para perfiles editoriales", () => {
		const html = renderToStaticMarkup(
			<AdminSidebar
				activeSection="dashboard"
				onSectionChange={() => undefined}
				userRole="author"
				userName="Autora"
			/>,
		);

		expect(html).toContain("Ayuda");
		expect(html).toContain("ayuda#publicar-recurso");
	});
});
