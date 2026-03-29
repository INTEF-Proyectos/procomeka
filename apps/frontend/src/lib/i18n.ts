/**
 * Locale bridge for Paraglide JS.
 *
 * - During SSG build: each .astro page calls setSsrLocale() before rendering.
 * - During client hydration: reads <html lang="...">.
 */
import {
	overwriteGetLocale,
	baseLocale,
	locales,
	isLocale,
} from "../paraglide/runtime.js";

let _ssrLocale: string = baseLocale;

function resolveLocale(): string {
	if (typeof document !== "undefined") {
		const htmlLang = document.documentElement.lang;
		if (htmlLang && isLocale(htmlLang)) return htmlLang;
	}
	return isLocale(_ssrLocale) ? _ssrLocale : baseLocale;
}

// Install the override immediately at import time.
overwriteGetLocale(resolveLocale);

/** Call from .astro frontmatter to set the locale for the current page render. */
export function setSsrLocale(locale: string): void {
	_ssrLocale = locale;
	// Re-install the override in case Paraglide re-initialized getLocale.
	overwriteGetLocale(resolveLocale);
}

export { locales, baseLocale, isLocale };

/** All supported locales with their display labels. */
export const LOCALE_LABELS: Record<string, string> = {
	es: "Español",
	en: "English",
	ca: "Català",
	gl: "Galego",
	eu: "Euskara",
};
