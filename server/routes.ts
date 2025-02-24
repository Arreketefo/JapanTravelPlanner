import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertSuggestionSchema, insertVoteSchema, insertExpenseSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/suggestions/:city", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const suggestions = await storage.getSuggestionsByCity(req.params.city);
    const suggestionsWithVotes = await Promise.all(
      suggestions.map(async (s) => ({
        ...s,
        votes: await storage.getVoteCountForSuggestion(s.id),
      }))
    );

    res.json(suggestionsWithVotes);
  });

  app.post("/api/suggestions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const parsedData = insertSuggestionSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json(parsedData.error);
    }

    const suggestion = await storage.createSuggestion(req.user!.id, parsedData.data);
    res.status(201).json(suggestion);
  });

  app.post("/api/votes", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const suggestionId = parseInt(req.body.suggestionId);
    if (isNaN(suggestionId)) {
      return res.status(400).json({ message: "Invalid suggestion ID" });
    }

    const suggestion = await storage.getSuggestionById(suggestionId);
    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" });
    }

    const parsedData = insertVoteSchema.safeParse({
      userId: req.user!.id,
      suggestionId: suggestionId
    });

    if (!parsedData.success) {
      return res.status(400).json(parsedData.error);
    }

    const vote = await storage.createVote({
      userId: req.user!.id,
      suggestionId: suggestionId,
    });

    res.status(201).json(vote);
  });

  app.get("/api/expenses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const expenses = await storage.getExpenses(req.user!.id);
    res.json(expenses);
  });

  app.post("/api/expenses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const parsedData = insertExpenseSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json(parsedData.error);
    }

    const expense = await storage.createExpense(req.user!.id, parsedData.data);
    res.status(201).json(expense);
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const expenseId = parseInt(req.params.id);
    if (isNaN(expenseId)) {
      return res.status(400).json({ message: "ID de gasto inválido" });
    }

    try {
      await storage.deleteExpense(req.user!.id, expenseId);
      res.sendStatus(200);
    } catch (error) {
      res.status(404).json({ message: error instanceof Error ? error.message : "Error al eliminar el gasto" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}