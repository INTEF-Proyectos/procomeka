/**
 * Returns the application base URL, resolved from window.__BASE_URL__ (client)
 * or import.meta.env.BASE_URL (SSR), defaulting to "/".
 */
export function getBaseUrl(): string {
	return (typeof window !== "undefined" &&
		(window as unknown as { __BASE_URL__?: string }).__BASE_URL__) ||
		(typeof import.meta !== "undefined" && import.meta.env?.BASE_URL) ||
		"/";
}

/**
 * Returns true when running in static preview mode (PGlite + IndexedDB).
 */
export function isPreviewMode(): boolean {
	return typeof window !== "undefined" && (window as Record<string, unknown>).__PREVIEW_MODE__ === true;
}

/** Returns the current locale from <html lang> (client) or "es" as fallback. */
export function getCurrentLocale(): string {
	if (typeof document !== "undefined") {
		return document.documentElement.lang || "es";
	}
	return "es";
}

/**
 * Helper para construir URLs relativas al base path de la aplicación.
 * Locale-aware: inserta el prefijo de idioma cuando no es el default (es).
 *
 * Funciona tanto en SSR (import.meta.env.BASE_URL) como en cliente (window.__BASE_URL__).
 */
export function url(path: string, locale?: string): string {
	const base = getBaseUrl();
	const effectiveLocale = locale ?? getCurrentLocale();
	const cleanPath = path.replace(/^\//, "");

	if (!effectiveLocale || effectiveLocale === "es") {
		return base + cleanPath;
	}
	return `${base}${effectiveLocale}/${cleanPath}`;
}
