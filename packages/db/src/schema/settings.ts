import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const platformSettings = pgTable("platform_settings", {
	key: varchar("key", { length: 100 }).primaryKey(),
	value: text("value").notNull(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
