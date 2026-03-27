import { describe, expect, test } from "bun:test";
import { isDevelopmentMode, resolveNodeEnv } from "./env.ts";

describe("runtime env helpers", () => {
	test("prioriza NODE_ENV de process.env", () => {
		expect(
			resolveNodeEnv(
				{ NODE_ENV: "development" },
				{ NODE_ENV: "production" },
			),
		).toBe("development");
		expect(isDevelopmentMode({ NODE_ENV: "development" })).toBe(true);
	});

	test("usa NODE_ENV de Bun.env como fallback", () => {
		expect(resolveNodeEnv({}, { NODE_ENV: "development" })).toBe("development");
		expect(isDevelopmentMode({}, { NODE_ENV: "development" })).toBe(true);
	});

	test("no habilita desarrollo en producción o sin variable", () => {
		expect(isDevelopmentMode({ NODE_ENV: "production" })).toBe(false);
		expect(isDevelopmentMode({}, {})).toBe(false);
	});
});
