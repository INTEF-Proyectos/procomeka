import { relations } from "drizzle-orm";
import {
	integer,
	pgTable,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth.ts";
import { resources } from "./resources.ts";

// Ratings: one rating per user per resource, score 1-5
export const ratings = pgTable(
	"ratings",
	{
		id: text("id").primaryKey(),
		resourceId: text("resource_id")
			.notNull()
			.references(() => resources.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		score: integer("score").notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [unique("ratings_user_resource").on(table.resourceId, table.userId)],
);

// Favorites: one favorite per user per resource
export const favorites = pgTable(
	"favorites",
	{
		id: text("id").primaryKey(),
		resourceId: text("resource_id")
			.notNull()
			.references(() => resources.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [unique("favorites_user_resource").on(table.resourceId, table.userId)],
);

// Downloads: tracks resource download events
export const downloads = pgTable("downloads", {
	id: text("id").primaryKey(),
	resourceId: text("resource_id")
		.notNull()
		.references(() => resources.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.references(() => user.id, { onDelete: "set null" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Activity events: user action history for the dashboard feed
export const activityEvents = pgTable("activity_events", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	type: varchar("type", { length: 50 }).notNull(),
	resourceId: text("resource_id")
		.references(() => resources.id, { onDelete: "set null" }),
	resourceTitle: text("resource_title"),
	resourceSlug: varchar("resource_slug", { length: 512 }),
	description: text("description").notNull(),
	metadata: text("metadata"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

// API access logs for ENS audit compliance
export const apiAccessLogs = pgTable("api_access_logs", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.references(() => user.id, { onDelete: "set null" }),
	method: varchar("method", { length: 10 }).notNull(),
	path: text("path").notNull(),
	status: integer("status").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	latencyMs: integer("latency_ms"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const ratingsRelations = relations(ratings, ({ one }) => ({
	resource: one(resources, {
		fields: [ratings.resourceId],
		references: [resources.id],
	}),
	user: one(user, {
		fields: [ratings.userId],
		references: [user.id],
	}),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
	resource: one(resources, {
		fields: [favorites.resourceId],
		references: [resources.id],
	}),
	user: one(user, {
		fields: [favorites.userId],
		references: [user.id],
	}),
}));

export const downloadsRelations = relations(downloads, ({ one }) => ({
	resource: one(resources, {
		fields: [downloads.resourceId],
		references: [resources.id],
	}),
	user: one(user, {
		fields: [downloads.userId],
		references: [user.id],
	}),
}));

export const activityEventsRelations = relations(activityEvents, ({ one }) => ({
	user: one(user, {
		fields: [activityEvents.userId],
		references: [user.id],
	}),
	resource: one(resources, {
		fields: [activityEvents.resourceId],
		references: [resources.id],
	}),
}));

export const apiAccessLogsRelations = relations(apiAccessLogs, ({ one }) => ({
	user: one(user, {
		fields: [apiAccessLogs.userId],
		references: [user.id],
	}),
}));
