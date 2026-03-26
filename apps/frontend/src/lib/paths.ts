/**
 * Helper para construir URLs relativas al base path de la aplicación.
 * Necesario para que la navegación funcione bajo subpaths como /procomeka/pr-preview/pr-123/
 */
export function url(path: string): string {
	const base =
		(typeof window !== "undefined" &&
			(window as unknown as { __BASE_URL__?: string }).__BASE_URL__) ||
		"/";

	let normalizedPath = path.replace(/^\//, "");

	// Si estamos en modo preview (estático), asegurar que los directorios terminan en /
	// para evitar 404 en GitHub Pages.
	const isPreview = typeof window !== "undefined" &&
		(window as unknown as { __PREVIEW_MODE__?: boolean }).__PREVIEW_MODE__ === true;

	if (isPreview && normalizedPath && !normalizedPath.includes(".") && !normalizedPath.endsWith("/")) {
		normalizedPath += "/";
	}

	return base + normalizedPath;
}
