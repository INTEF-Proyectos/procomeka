type RuntimeEnv = Record<string, string | undefined>;

export function resolveNodeEnv(
	env: RuntimeEnv = process.env,
	bunEnv: RuntimeEnv | undefined = typeof Bun !== "undefined" ? Bun.env : undefined,
): string | undefined {
	return env.NODE_ENV ?? bunEnv?.NODE_ENV;
}

export function isDevelopmentMode(
	env: RuntimeEnv = process.env,
	bunEnv: RuntimeEnv | undefined = typeof Bun !== "undefined" ? Bun.env : undefined,
): boolean {
	return resolveNodeEnv(env, bunEnv) === "development";
}
