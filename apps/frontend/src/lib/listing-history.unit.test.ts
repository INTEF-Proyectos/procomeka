import { describe, expect, mock, test } from "bun:test";

import { buildListingUrl, writeListingStateToHistory } from "./listing-history.ts";

describe("listing history helpers", () => {
	test("builds listing URL with query and page", () => {
		expect(buildListingUrl("/", "", "matematicas", 3)).toBe("/?q=matematicas&page=3");
	});

	test("drops page parameter when navigating to first page", () => {
		expect(buildListingUrl("/", "?q=matematicas&page=2", "matematicas", 1)).toBe("/?q=matematicas");
	});

	test("uses pushState in push mode", () => {
		const history = {
			pushState: mock(() => {}),
			replaceState: mock(() => {}),
		};

		writeListingStateToHistory(history, "/?q=matematicas&page=2", "push");

		expect(history.pushState).toHaveBeenCalledWith({}, "", "/?q=matematicas&page=2");
		expect(history.replaceState).not.toHaveBeenCalled();
	});

	test("uses replaceState in replace mode", () => {
		const history = {
			pushState: mock(() => {}),
			replaceState: mock(() => {}),
		};

		writeListingStateToHistory(history, "/?q=matematicas&page=2", "replace");

		expect(history.replaceState).toHaveBeenCalledWith({}, "", "/?q=matematicas&page=2");
		expect(history.pushState).not.toHaveBeenCalled();
	});
});
