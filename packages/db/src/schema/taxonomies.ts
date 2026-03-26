import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const taxonomies = pgTable("taxonomies", {
	id: text("id").primaryKey(),
	slug: varchar("slug", { length: 512 }).notNull().unique(),
	name: text("name").notNull(),
	description: text("description"),
	type: varchar("type", { length: 50 }).notNull(), // e.g., 'subject', 'level', 'category'
	parentId: text("parent_id"), // for hierarchy
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const taxonomiesRelations = relations(taxonomies, ({ one, many }) => ({
	parent: one(taxonomies, {
		fields: [taxonomies.parentId],
		references: [taxonomies.id],
		relationName: "hierarchy",
	}),
	children: many(taxonomies, {
		relationName: "hierarchy",
	}),
}));
