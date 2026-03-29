/**
 * Client-side Paraglide initialization for React islands.
 * Import this as a side-effect before using any message functions.
 */
import { overwriteGetLocale, baseLocale, isLocale } from "../paraglide/runtime.js";

overwriteGetLocale(() => {
	if (typeof document !== "undefined") {
		const lang = document.documentElement.lang;
		if (isLocale(lang)) return lang;
	}
	return baseLocale;
});
