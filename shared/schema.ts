import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const suggestions = pgTable("suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  city: text("city").notNull(),
  day: integer("day").notNull(),
  period: text("period").notNull(), // 'morning' o 'afternoon'
  placeName: text("place_name").notNull(),
  description: text("description").notNull(),
  link: text("link"),
  isDefault: boolean("is_default").default(false),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  suggestionId: integer("suggestion_id").notNull(),
  voteDate: timestamp("vote_date").defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  concept: text("concept").notNull(),
  amount: integer("amount").notNull(), // en yenes
  date: timestamp("date").defaultNow(),
  userId: integer("user_id").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSuggestionSchema = createInsertSchema(suggestions)
  .omit({ id: true, userId: true, createdAt: true, isDefault: true })
  .extend({
    city: z.enum(["osaka", "kyoto", "tokyo"]),
    period: z.enum(["morning", "afternoon"]),
  });

export const insertVoteSchema = createInsertSchema(votes)
  .omit({ id: true, voteDate: true });

export const insertExpenseSchema = createInsertSchema(expenses)
  .omit({ id: true, date: true, userId: true })
  .extend({
    amount: z.number().int("El importe debe ser un número entero")
      .min(1, "El importe debe ser mayor que 0 yenes")
      .describe("Importe en yenes"),
    concept: z.string()
      .min(1, "El concepto no puede estar vacío")
      .max(100, "El concepto no puede tener más de 100 caracteres")
      .describe("Concepto del gasto"),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Suggestion = typeof suggestions.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type InsertSuggestion = z.infer<typeof insertSuggestionSchema>;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;