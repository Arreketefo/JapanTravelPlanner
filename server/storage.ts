import { User, Suggestion, InsertSuggestion, Vote, InsertVote, Expense, InsertExpense } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { endOfDay, startOfDay } from "date-fns";
import { hashPassword } from "./passwords";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createSuggestion(userId: number, data: InsertSuggestion): Promise<Suggestion>;
  getSuggestionsByCity(city: string): Promise<Suggestion[]>;
  createVote(data: InsertVote): Promise<Vote>;
  getVotesByUserAndDate(userId: number, date: Date): Promise<Vote[]>;
  getVoteCountForSuggestion(suggestionId: number): Promise<number>;
  createExpense(userId: number, data: InsertExpense): Promise<Expense>;
  getExpenses(userId: number): Promise<Expense[]>;
  getSuggestionById(id: number): Promise<Suggestion | undefined>;
  deleteExpense(userId: number, expenseId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private suggestions: Map<number, Suggestion>;
  private votes: Map<number, Vote>;
  private expenses: Map<number, Expense>;
  sessionStore: session.Store;
  currentId: number;

  constructor(username: string, passwordHash: string) {
    this.users = new Map();
    this.suggestions = new Map();
    this.votes = new Map();
    this.expenses = new Map();
    this.currentId = 100; // Empezamos desde 100 para dejar espacio para las sugerencias predefinidas
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // The demo account is configured at runtime; no credential is stored in Git.
    this.users.set(1, {
      id: 1,
      username,
      password: passwordHash,
    });

    // Add default suggestions
    defaultSuggestions.forEach((suggestion, index) => {
      this.suggestions.set(index + 1, {
        id: index + 1,
        userId: 1,
        createdAt: new Date(),
        ...suggestion,
      });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createSuggestion(userId: number, data: InsertSuggestion): Promise<Suggestion> {
    const id = this.currentId++;
    const suggestion: Suggestion = {
      id,
      userId,
      ...data,
      isDefault: false,
      createdAt: new Date(),
      link: data.link || null,
    };
    this.suggestions.set(id, suggestion);
    return suggestion;
  }

  async getSuggestionsByCity(city: string): Promise<Suggestion[]> {
    return Array.from(this.suggestions.values())
      .filter(s => s.city === city)
      .sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        if (a.period !== b.period) return a.period === "morning" ? -1 : 1;
        return a.order - b.order;
      });
  }

  async createVote(data: InsertVote): Promise<Vote> {
    const id = this.currentId++;
    const vote: Vote = {
      id,
      ...data,
      voteDate: new Date(),
    };
    this.votes.set(id, vote);
    return vote;
  }

  async getVotesByUserAndDate(userId: number, date: Date): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter(vote => 
      vote.userId === userId &&
      vote.voteDate !== null &&
      vote.voteDate >= startOfDay(date) &&
      vote.voteDate <= endOfDay(date)
    );
  }

  async getVoteCountForSuggestion(suggestionId: number): Promise<number> {
    return Array.from(this.votes.values()).filter(v => v.suggestionId === suggestionId).length;
  }

  async createExpense(userId: number, data: InsertExpense): Promise<Expense> {
    const id = this.currentId++;
    const expense: Expense = {
      id,
      userId,
      ...data,
      date: new Date(),
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async getExpenses(userId: number): Promise<Expense[]> {
    return Array.from(this.expenses.values())
      .filter(e => e.userId === userId)
      .sort((a, b) => b.date!.getTime() - a.date!.getTime());
  }

  async getSuggestionById(id: number): Promise<Suggestion | undefined> {
    return this.suggestions.get(id);
  }

  async deleteExpense(userId: number, expenseId: number): Promise<void> {
    const expense = Array.from(this.expenses.values()).find(
      e => e.id === expenseId && e.userId === userId
    );

    if (!expense) {
      throw new Error("Gasto no encontrado o no tienes permiso para eliminarlo");
    }

    this.expenses.delete(expenseId);
  }
}

const defaultSuggestions: Array<Omit<Suggestion, "id" | "userId" | "createdAt">> = [
  // DÍA 1 - OSAKA
  {
    city: "osaka",
    day: 1,
    period: "morning",
    placeName: "Castillo de Osaka",
    description: "Emblemático castillo rodeado de hermosos jardines.",
    link: null,
    isDefault: true,
    order: 1
  },
  {
    city: "osaka",
    day: 1,
    period: "morning",
    placeName: "Parque del Castillo",
    description: "Paseo por los alrededores, ideal para fotos y relajarse.",
    link: null,
    isDefault: true,
    order: 2
  },
  {
    city: "osaka",
    day: 1,
    period: "afternoon",
    placeName: "Distrito de Dotonbori",
    description: "Famoso por sus luces de neón, carteles icónicos (como el Glico Man) y ambiente animado.",
    link: null,
    isDefault: true,
    order: 3
  },
  {
    city: "osaka",
    day: 1,
    period: "afternoon",
    placeName: "Cena en Dotonbori",
    description: "Prueben el takoyaki y el okonomiyaki, platos típicos de Osaka.",
    link: null,
    isDefault: true,
    order: 4
  },
  // DÍA 2 - OSAKA
  {
    city: "osaka",
    day: 2,
    period: "morning",
    placeName: "Acuario Kaiyukan",
    description: "Uno de los acuarios más grandes del mundo, con una increíble colección marina.",
    link: null,
    isDefault: true,
    order: 1
  },
  {
    city: "osaka",
    day: 2,
    period: "morning",
    placeName: "Tempozan Marketplace",
    description: "Mercado con tiendas y restaurantes cercanos al acuario.",
    link: null,
    isDefault: true,
    order: 2
  },
  {
    city: "osaka",
    day: 2,
    period: "afternoon",
    placeName: "Shinsekai",
    description: "Barrio retro con la icónica torre Tsutenkaku y ambiente auténtico.",
    link: null,
    isDefault: true,
    order: 3
  },
  {
    city: "osaka",
    day: 2,
    period: "afternoon",
    placeName: "Umeda Sky Building",
    description: "Disfruten de las vistas panorámicas desde su mirador al atardecer.",
    link: null,
    isDefault: true,
    order: 4
  },
  // DÍA 3 - KYOTO
  {
    city: "kyoto",
    day: 3,
    period: "morning",
    placeName: "Fushimi Inari Taisha",
    description: "El icónico santuario con miles de torii rojos formando túneles.",
    link: null,
    isDefault: true,
    order: 1
  },
  {
    city: "kyoto",
    day: 3,
    period: "morning",
    placeName: "Área de Fushimi",
    description: "Paseo por el área de Fushimi, con tiendas tradicionales.",
    link: null,
    isDefault: true,
    order: 2
  },
  {
    city: "kyoto",
    day: 3,
    period: "afternoon",
    placeName: "Templo Kiyomizudera",
    description: "Famoso por su terraza con vistas a la ciudad.",
    link: null,
    isDefault: true,
    order: 3
  },
  {
    city: "kyoto",
    day: 3,
    period: "afternoon",
    placeName: "Sannenzaka y Ninenzaka",
    description: "Calles empedradas con tiendas y cafeterías tradicionales.",
    link: null,
    isDefault: true,
    order: 4
  },
  // DÍA 4 - KYOTO
  {
    city: "kyoto",
    day: 4,
    period: "morning",
    placeName: "Bosque de Bambú de Arashiyama",
    description: "Un paseo mágico entre altos bambús.",
    link: null,
    isDefault: true,
    order: 1
  },
  {
    city: "kyoto",
    day: 4,
    period: "morning",
    placeName: "Templo Tenryuji",
    description: "Patrimonio de la Humanidad con bellos jardines.",
    link: null,
    isDefault: true,
    order: 2
  },
  {
    city: "kyoto",
    day: 4,
    period: "afternoon",
    placeName: "Iwatayama Monkey Park",
    description: "Con vista panorámica y monos en libertad.",
    link: null,
    isDefault: true,
    order: 3
  },
  {
    city: "kyoto",
    day: 4,
    period: "afternoon",
    placeName: "Puente Togetsukyo",
    description: "Paseo por el Puente Togetsukyo y disfrutar del área al atardecer.",
    link: null,
    isDefault: true,
    order: 4
  },
  // DÍA 5 - KYOTO
  {
    city: "kyoto",
    day: 5,
    period: "morning",
    placeName: "Templo Kinkaku-ji",
    description: "Uno de los templos más fotografiados de Japón.",
    link: null,
    isDefault: true,
    order: 1
  },
  {
    city: "kyoto",
    day: 5,
    period: "morning",
    placeName: "Ryoan-ji",
    description: "Con su famoso jardín zen.",
    link: null,
    isDefault: true,
    order: 2
  },
  {
    city: "kyoto",
    day: 5,
    period: "afternoon",
    placeName: "Castillo Nijo",
    description: "Antigua residencia de los shogunes Tokugawa.",
    link: null,
    isDefault: true,
    order: 3
  },
  {
    city: "kyoto",
    day: 5,
    period: "afternoon",
    placeName: "Pontocho y Gion",
    description: "Busquen geishas y disfruten del ambiente tradicional.",
    link: null,
    isDefault: true,
    order: 4
  },
  // DÍA 6 - KYOTO
  {
    city: "kyoto",
    day: 6,
    period: "morning",
    placeName: "Templo Ginkaku-ji",
    description: "Menos concurrido pero encantador.",
    link: null,
    isDefault: true,
    order: 1
  },
  {
    city: "kyoto",
    day: 6,
    period: "morning",
    placeName: "Camino del Filósofo",
    description: "Sendero rodeado de cerezos y pequeños templos.",
    link: null,
    isDefault: true,
    order: 2
  },
  {
    city: "kyoto",
    day: 6,
    period: "afternoon",
    placeName: "Mercado Nishiki",
    description: "Ideal para probar comida callejera y comprar recuerdos.",
    link: null,
    isDefault: true,
    order: 3
  },
  {
    city: "kyoto",
    day: 6,
    period: "afternoon",
    placeName: "Cena en Kyoto",
    description: "Última noche en Kyoto disfrutando de la gastronomía local.",
    link: null,
    isDefault: true,
    order: 4
  },
  // DÍA 7 - TOKYO
  {
    city: "tokyo",
    day: 7,
    period: "morning",
    placeName: "Asakusa y Templo Senso-ji",
    description: "El templo más antiguo de Tokio y sus alrededores tradicionales.",
    link: null,
    isDefault: true,
    order: 1
  },
  {
    city: "tokyo",
    day: 7,
    period: "morning",
    placeName: "Calle Nakamise",
    description: "Para souvenirs y snacks japoneses.",
    link: null,
    isDefault: true,
    order: 2
  },
  {
    city: "tokyo",
    day: 7,
    period: "afternoon",
    placeName: "Ueno Park",
    description: "Ueno Park y su zona de museos o el mercado Ameyoko.",
    link: null,
    isDefault: true,
    order: 3
  },
  {
    city: "tokyo",
    day: 7,
    period: "afternoon",
    placeName: "Akihabara",
    description: "Cena en Akihabara si les gusta el anime, manga y la cultura otaku.",
    link: null,
    isDefault: true,
    order: 4
  },
  // DÍA 8 - TOKYO
  {
    city: "tokyo",
    day: 8,
    period: "morning",
    placeName: "Meiji Jingu",
    description: "Uno de los santuarios sintoístas más importantes.",
    link: null,
    isDefault: true,
    order: 1
  },
  {
    city: "tokyo",
    day: 8,
    period: "morning",
    placeName: "Harajuku",
    description: "Paseo por Harajuku y la calle Takeshita-dori para moda y tiendas curiosas.",
    link: null,
    isDefault: true,
    order: 2
  },
  {
    city: "tokyo",
    day: 8,
    period: "afternoon",
    placeName: "Shibuya",
    description: "Cruce más famoso del mundo y la estatua de Hachiko.",
    link: null,
    isDefault: true,
    order: 3
  },
  {
    city: "tokyo",
    day: 8,
    period: "afternoon",
    placeName: "Shibuya Sky",
    description: "Suban al Shibuya Sky para una vista panorámica al atardecer.",
    link: null,
    isDefault: true,
    order: 4
  },
  // DÍA 9 - TOKYO
  {
    city: "tokyo",
    day: 9,
    period: "morning",
    placeName: "Mercado Tsukiji",
    description: "Mercado Tsukiji (aún con tiendas y restaurantes).",
    link: null,
    isDefault: true,
    order: 1
  },
  {
    city: "tokyo",
    day: 9,
    period: "afternoon",
    placeName: "Odaiba",
    description: "Isla futurista con centros comerciales, vistas de la bahía y la réplica de la Estatua de la Libertad.",
    link: null,
    isDefault: true,
    order: 2
  },
  {
    city: "tokyo",
    day: 9,
    period: "afternoon",
    placeName: "Rainbow Bridge",
    description: "Ver el atardecer en el Rainbow Bridge.",
    link: null,
    isDefault: true,
    order: 3
  },
  // DÍA 10 - TOKYO
  {
    city: "tokyo",
    day: 10,
    period: "morning",
    placeName: "TeamLab Planets",
    description: "Arte digital inmersivo y experiencias visuales únicas.",
    link: null,
    isDefault: true,
    order: 1
  },
  {
    city: "tokyo",
    day: 10,
    period: "afternoon",
    placeName: "Tokyo Skytree",
    description: "Una de las torres más altas del mundo con vistas impresionantes de la ciudad.",
    link: null,
    isDefault: true,
    order: 2
  }
];

const isProduction = process.env.NODE_ENV === "production";
const configuredUsername = process.env.APP_USERNAME;
const configuredPassword = process.env.APP_PASSWORD;

if (isProduction && (!configuredUsername || !configuredPassword)) {
  throw new Error("APP_USERNAME and APP_PASSWORD are required in production");
}

const username = configuredUsername || "demo";
const password = configuredPassword || "local-demo-only";

export const storage = new MemStorage(username, hashPassword(password));
