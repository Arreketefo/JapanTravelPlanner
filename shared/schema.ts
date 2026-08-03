import { z } from "zod";

function isSafeHttpUrl(value: string): boolean {
  if (value === "") return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export const citySchema = z.enum(["osaka", "kyoto", "tokyo"]);
export const periodSchema = z.enum(["morning", "afternoon"]);

export const userSchema = z.object({
  id: z.number().int().positive(),
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1),
});

export const insertUserSchema = userSchema.pick({
  username: true,
  password: true,
}).extend({
  password: z.string().min(8, "Password must contain at least 8 characters"),
});

export const publicUserSchema = userSchema.omit({ password: true });

export const suggestionSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  city: citySchema,
  day: z.number().int().min(1).max(31),
  period: periodSchema,
  placeName: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(600),
  link: z.string().max(2048).nullable(),
  isDefault: z.boolean(),
  order: z.number().int().min(0),
  createdAt: z.date().nullable(),
});

export const insertSuggestionSchema = suggestionSchema
  .omit({ id: true, userId: true, createdAt: true, isDefault: true })
  .extend({
    link: z
      .string()
      .max(2048)
      .refine(isSafeHttpUrl, "Link must be an absolute HTTP or HTTPS URL")
      .nullable()
      .optional(),
  });

export const voteSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  suggestionId: z.number().int().positive(),
  voteDate: z.date().nullable(),
});

export const insertVoteSchema = voteSchema.omit({ id: true, voteDate: true });

export const expenseSchema = z.object({
  id: z.number().int().positive(),
  concept: z.string().trim().min(1).max(100),
  amount: z.number().int().positive(),
  date: z.date().nullable(),
  userId: z.number().int().positive(),
});

export const insertExpenseSchema = expenseSchema.omit({
  id: true,
  date: true,
  userId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof userSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;
export type Suggestion = z.infer<typeof suggestionSchema>;
export type Vote = z.infer<typeof voteSchema>;
export type Expense = z.infer<typeof expenseSchema>;
export type InsertSuggestion = z.infer<typeof insertSuggestionSchema>;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
