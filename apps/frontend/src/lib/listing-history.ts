export type HistoryUpdateMode = "push" | "replace";

interface HistoryLike {
	pushState(data: unknown, unused: string, url?: string | URL | null): void;
	replaceState(data: unknown, unused: string, url?: string | URL | null): void;
}

export function buildListingUrl(pathname: string, search: string, query: string, page: number): string {
	const params = new URLSearchParams(search);
	if (query) {
		params.set("q", query);
	} else {
		params.delete("q");
	}

	if (page > 1) {
		params.set("page", String(page));
	} else {
		params.delete("page");
	}

	const queryString = params.toString();
	return queryString ? `${pathname}?${queryString}` : pathname;
}

export function writeListingStateToHistory(
	history: HistoryLike,
	targetUrl: string,
	mode: HistoryUpdateMode,
): void {
	if (mode === "push") {
		history.pushState({}, "", targetUrl);
		return;
	}

	history.replaceState({}, "", targetUrl);
}
