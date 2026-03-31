import { describe, expect, test } from "bun:test";
import { extractLineCoverage, stripAnsiCodes } from "./check-coverage.ts";

describe("check-coverage helpers", () => {
	test("stripAnsiCodes removes terminal escape sequences", () => {
		expect(stripAnsiCodes("\u001b[31merror\u001b[0m")).toBe("error");
	});

	test("extractLineCoverage parses bun coverage output", () => {
		const output = [
			"File | % Funcs | % Lines",
			"All files | 91.20 | 93.40",
		].join("\n");

		expect(extractLineCoverage(output)).toBe(93.4);
	});

	test("extractLineCoverage returns null when coverage summary is missing", () => {
		expect(extractLineCoverage("sin resumen")).toBeNull();
	});
});
