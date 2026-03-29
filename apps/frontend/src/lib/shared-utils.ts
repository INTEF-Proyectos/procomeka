/**
 * Shared utility functions used across multiple islands and pages.
 */

/** Simple hash for gravatar URLs — deterministic, synchronous. */
function hashPair(str: string): string {
	let h1 = 0xdeadbeef;
	let h2 = 0x41c6ce57;
	for (let i = 0; i < str.length; i++) {
		const ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
	return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
}

/** Generate a Gravatar URL for an email. Uses `d=mp` fallback (mystery person). */
export function gravatarUrl(email: string, size = 80): string {
	const hash = hashPair(email.trim().toLowerCase());
	return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp`;
}

/** Format a date value for display in Spanish locale. */
export function formatDate(value: string | number | Date | null | undefined): string {
	if (!value) return "";
	return new Date(value).toLocaleDateString("es-ES", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

/** Format a date value with long month for display. */
export function formatDateLong(value: string | number | Date | null | undefined): string {
	if (!value) return "";
	return new Date(value).toLocaleDateString("es-ES", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

/** Compute display badges (Novedad / Destacado) for a resource. */
export function computeResourceBadges(
	resource: {
		createdAt?: string | number | Date | null;
		rating?: { average: number; count: number };
		favoriteCount?: number;
	},
	config: {
		novedadDays: number;
		destacadoMinRatings: number;
		destacadoMinAvg: number;
		destacadoMinFavorites: number;
	},
): { text: string; variant: "primary" | "tertiary" }[] {
	const badges: { text: string; variant: "primary" | "tertiary" }[] = [];

	const createdAt = resource.createdAt ? new Date(resource.createdAt) : null;
	if (createdAt) {
		const daysSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / 86400000);
		if (daysSinceCreation <= config.novedadDays) {
			badges.push({ text: "Novedad", variant: "primary" });
		}
	}

	const rating = resource.rating;
	const favCount = Number(resource.favoriteCount ?? 0);
	if (
		rating &&
		rating.count >= config.destacadoMinRatings &&
		rating.average >= config.destacadoMinAvg &&
		favCount >= config.destacadoMinFavorites
	) {
		badges.push({ text: "Destacado", variant: "tertiary" });
	}

	return badges;
}

/** Role hierarchy levels. Canonical source — import from here. */
export const ROLE_LEVELS: Record<string, number> = {
	reader: 0,
	author: 1,
	curator: 2,
	admin: 3,
};
