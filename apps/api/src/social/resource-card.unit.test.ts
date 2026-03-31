import { describe, expect, test } from "bun:test";
import { buildResourceCard, roundRatingAverage } from "./resource-card.ts";

describe("resource-card", () => {
	test("buildResourceCard normalizes missing social signals", () => {
		const card = buildResourceCard(
			{ id: "res-1", title: "Demo" },
			{},
		);

		expect(card.elpxPreview).toBeNull();
		expect(card.favoriteCount).toBe(0);
		expect(card.rating).toEqual({ average: 0, count: 0 });
	});

	test("roundRatingAverage rounds to two decimals", () => {
		expect(roundRatingAverage(4.126)).toBe(4.13);
		expect(roundRatingAverage(undefined)).toBe(0);
	});
});
