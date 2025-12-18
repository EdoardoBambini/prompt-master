import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  problemStatement: text("problem_statement").notNull(),
  mode: varchar("mode", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("in_progress"),
  currentStep: integer("current_step").notNull().default(0),
  completedSteps: json("completed_steps").$type<number[]>().notNull().default([]),
  stopReason: text("stop_reason"),
  stepData: json("step_data").$type<Record<string, any>>().notNull().default({}),
  evidenceCardIds: json("evidence_card_ids").$type<string[]>().notNull().default([]),
  hypothesisCardIds: json("hypothesis_card_ids").$type<string[]>().notNull().default([]),
  roadmapCardId: text("roadmap_card_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
});

export const selectUserSchema = createSelectSchema(users);

export const insertSessionSchema = createInsertSchema(sessions).omit({
  createdAt: true,
  updatedAt: true,
});

export const selectSessionSchema = createSelectSchema(sessions);

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;
