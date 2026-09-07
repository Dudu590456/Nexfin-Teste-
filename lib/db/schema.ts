import { pgTable, text, boolean, integer, doublePrecision, jsonb, timestamp } from "drizzle-orm/pg-core";

export const userProfiles = pgTable("user_profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  cpf: text("cpf").notNull(),
  avatar: text("avatar").notNull(),
  theme: text("theme").default("dark").notNull(),
  language: text("language").default("pt").notNull(),
  notificationsEnabled: boolean("notifications_enabled").default(true).notNull(),
  aiGrounding: boolean("ai_grounding").default(true).notNull(),
  realtimeSync: boolean("realtime_sync").default(true).notNull(),
  password: text("password"),
});

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // 'income' | 'expense'
  category: text("category").notNull(),
  amount: doublePrecision("amount").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(),
  cardId: text("card_id"),
  status: text("status").notNull(), // 'paid' | 'pending'
});

export const goals = pgTable("goals", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  targetAmount: doublePrecision("target_amount").notNull(),
  currentAmount: doublePrecision("current_amount").notNull(),
  category: text("category").notNull(),
  deadline: text("deadline").notNull(),
});

export const budgets = pgTable("budgets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  category: text("category").notNull(),
  limitAmount: doublePrecision("limit_amount").notNull(),
  spentAmount: doublePrecision("spent_amount").notNull(),
  month: text("month").notNull(),
});

export const investments = pgTable("investments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  amount: doublePrecision("amount").notNull(),
  yieldRate: text("yield_rate").notNull(),
  date: text("date").notNull(),
});

export const attachments = pgTable("attachments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  transactionId: text("transaction_id"),
  name: text("name").notNull(),
  size: text("size").notNull(),
  type: text("type").notNull(),
  url: text("url").notNull(),
  uploadedAt: text("uploaded_at").notNull(),
});

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // 'warning' | 'danger' | 'success' | 'info'
  title: text("title").notNull(),
  message: text("message").notNull(),
  date: text("date").notNull(),
  read: boolean("read").default(false).notNull(),
});

export const calendarEvents = pgTable("calendar_events", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  amount: doublePrecision("amount").notNull(),
  type: text("type").notNull(), // 'income' | 'expense'
  date: text("date").notNull(),
  status: text("status").notNull(), // 'paid' | 'pending'
  isRecurring: boolean("is_recurring").default(false).notNull(),
});

export const cards = pgTable("cards", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  limit: doublePrecision("limit").notNull(),
  currentSpent: doublePrecision("current_spent").notNull(),
  color: text("color").notNull(),
  expiry: text("expiry").notNull(),
  lastFour: text("last_four").notNull(),
});

export const installments = pgTable("installments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  description: text("description").notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
  installmentsCount: integer("installments_count").notNull(),
  installmentAmount: doublePrecision("installment_amount").notNull(),
  currentInstallment: integer("current_installment").notNull(),
  category: text("category").notNull(),
  firstDueDate: text("first_due_date").notNull(),
});

export const financialReports = pgTable("financial_reports", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // 'monthly' | 'quarterly' | 'yearly'
  title: text("title").notNull(),
  fileUrl: text("file_url").notNull(),
  generatedAt: text("generated_at").notNull(),
});

export const financialScores = pgTable("financial_scores", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  score: integer("score").notNull(),
  organization: integer("organization").notNull(),
  control: integer("control").notNull(),
  savings: integer("savings").notNull(),
  reserve: integer("reserve").notNull(),
  goals: integer("goals").notNull(),
  punctuality: integer("punctuality").notNull(),
  suggestions: jsonb("suggestions").$type<string[]>().notNull(),
});

export const aiHistoryItems = pgTable("ai_history_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  role: text("role").notNull(), // 'user' | 'model'
  content: text("content").notNull(),
  timestamp: text("timestamp").notNull(),
});

export interface ChecklistItemType {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

export const notes = pgTable("notes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").default("Geral").notNull(),
  color: text("color").default("blue").notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  updatedAt: text("updated_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const checklists = pgTable("checklists", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  category: text("category").default("Geral").notNull(),
  items: jsonb("items").$type<ChecklistItemType[]>().notNull(),
  createdAt: text("created_at").notNull(),
});
