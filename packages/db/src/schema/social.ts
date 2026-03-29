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

// Comments: threaded comments on resources with moderation support
export const comments = pgTable("comments", {
	id: text("id").primaryKey(),
	resourceId: text("resource_id")
		.notNull()
		.references(() => resources.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	parentId: text("parent_id"),
	body: text("body").notNull(),
	status: varchar("status", { length: 50 }).notNull().default("visible"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	deletedAt: timestamp("deleted_at"),
});

// Comment votes: "useful" engagement signal
export const commentVotes = pgTable(
	"comment_votes",
	{
		id: text("id").primaryKey(),
		commentId: text("comment_id")
			.notNull()
			.references(() => comments.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		voteType: varchar("vote_type", { length: 20 }).notNull().default("useful"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [unique("comment_votes_user_comment").on(table.commentId, table.userId)],
);

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

export const commentsRelations = relations(comments, ({ one, many }) => ({
	resource: one(resources, {
		fields: [comments.resourceId],
		references: [resources.id],
	}),
	user: one(user, {
		fields: [comments.userId],
		references: [user.id],
	}),
	parent: one(comments, {
		fields: [comments.parentId],
		references: [comments.id],
		relationName: "commentReplies",
	}),
	replies: many(comments, { relationName: "commentReplies" }),
	votes: many(commentVotes),
}));

export const commentVotesRelations = relations(commentVotes, ({ one }) => ({
	comment: one(comments, {
		fields: [commentVotes.commentId],
		references: [comments.id],
	}),
	user: one(user, {
		fields: [commentVotes.userId],
		references: [user.id],
	}),
}));

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
