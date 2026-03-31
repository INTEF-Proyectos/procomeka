export type DrizzleDB = {
	select: (...args: unknown[]) => unknown;
	insert: (...args: unknown[]) => unknown;
	update: (...args: unknown[]) => unknown;
	// biome-ignore lint: generic drizzle db type
	[key: string]: any;
};
