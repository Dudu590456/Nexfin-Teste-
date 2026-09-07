export interface UserProfile {
  id: string;
  name: string;
  email: string;
  cpf: string;
  avatar: string;
  theme: "dark" | "light";
  language: "pt" | "en";
  preferences: {
    notificationsEnabled: boolean;
    aiGrounding: boolean;
    realtimeSync: boolean;
  };
}

export interface Transaction {
  id: string;
  userId: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  date: string;
  cardId?: string;
  status: "paid" | "pending";
  paymentMethod?: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  deadline: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limitAmount: number;
  spentAmount: number;
  month: string;
}

export interface Investment {
  id: string;
  userId: string;
  name: string;
  category: string;
  amount: number;
  yieldRate: string; // e.g., "115% CDI"
  date: string;
}

export interface Attachment {
  id: string;
  userId: string;
  transactionId?: string;
  name: string;
  size: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "warning" | "danger" | "success" | "info";
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  status: "paid" | "pending";
  isRecurring: boolean;
}

export interface Card {
  id: string;
  userId: string;
  name: string;
  limit: number;
  currentSpent: number;
  color: string;
  expiry: string;
  lastFour: string;
}

export interface Installment {
  id: string;
  userId: string;
  description: string;
  totalAmount: number;
  installmentsCount: number;
  installmentAmount: number;
  currentInstallment: number;
  category: string;
  firstDueDate: string;
}

export interface FinancialReport {
  id: string;
  userId: string;
  type: "monthly" | "quarterly" | "yearly";
  title: string;
  fileUrl: string;
  generatedAt: string;
}

export interface FinancialScore {
  id: string;
  userId: string;
  score: number;
  details: {
    organization: number; // 0-100
    control: number; // 0-100
    savings: number; // 0-100
    reserve: number; // 0-100
    goals: number; // 0-100
    punctuality: number; // 0-100
  };
  suggestions: string[];
}

export interface AIHistoryItem {
  id: string;
  userId: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

// Simulated real-time BroadcastChannel for cross-tab or simulated device sync
let syncChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined") {
  syncChannel = new BroadcastChannel("nexfin_realtime_sync");
}

const DEFAULT_PROFILE: UserProfile = {
  id: "user-123",
  name: "Eduardo Rocha",
  email: "edu.rocha785@gmail.com",
  cpf: "123.456.789-00",
  avatar: "https://picsum.photos/seed/eduardo/150/150",
  theme: "dark",
  language: "pt",
  preferences: {
    notificationsEnabled: true,
    aiGrounding: true,
    realtimeSync: true,
  },
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "t-1", userId: "user-123", type: "income", category: "Salário", amount: 12500, description: "Salário NexFin Enterprise", date: "2026-06-05", status: "paid" },
  { id: "t-2", userId: "user-123", type: "income", category: "Investimentos", amount: 1200, description: "Dividendos FIIs", date: "2026-06-15", status: "paid" },
  { id: "t-3", userId: "user-123", type: "expense", category: "Moradia", amount: 3200, description: "Aluguel & Condomínio", date: "2026-06-10", status: "paid" },
  { id: "t-4", userId: "user-123", type: "expense", category: "Alimentação", amount: 1150, description: "Supermercado Gourmet", date: "2026-06-12", status: "paid" },
  { id: "t-5", userId: "user-123", type: "expense", category: "Lazer", amount: 850, description: "Jantar Premium e Vinhos", date: "2026-06-20", status: "paid" },
  { id: "t-6", userId: "user-123", type: "expense", category: "Transporte", amount: 450, description: "Combustível e Uber", date: "2026-06-22", status: "paid" },
  { id: "t-7", userId: "user-123", type: "expense", category: "Assinaturas", amount: 120, description: "Netflix Premium & Spotify", date: "2026-06-01", status: "paid" },
  { id: "t-8", userId: "user-123", type: "expense", category: "Assinaturas", amount: 250, description: "Adobe Creative Cloud", date: "2026-06-02", status: "paid" },
  { id: "t-9", userId: "user-123", type: "expense", category: "Moradia", amount: 350, description: "Conta de Energia Coelba", date: "2026-06-28", status: "pending" },
];

const INITIAL_GOALS: Goal[] = [
  { id: "g-1", userId: "user-123", name: "Reserva de Emergência", targetAmount: 50000, currentAmount: 35000, category: "Investimentos", deadline: "2026-12-31" },
  { id: "g-2", userId: "user-123", name: "Viagem para o Japão", targetAmount: 30000, currentAmount: 18000, category: "Lazer", deadline: "2027-05-15" },
  { id: "g-3", userId: "user-123", name: "Troca de Carro", targetAmount: 80000, currentAmount: 20000, category: "Transporte", deadline: "2027-10-01" },
];

const INITIAL_BUDGETS: Budget[] = [
  { id: "b-1", userId: "user-123", category: "Alimentação", limitAmount: 1500, spentAmount: 1150, month: "2026-06" },
  { id: "b-2", userId: "user-123", category: "Lazer", limitAmount: 1000, spentAmount: 850, month: "2026-06" },
  { id: "b-3", userId: "user-123", category: "Transporte", limitAmount: 600, spentAmount: 450, month: "2026-06" },
  { id: "b-4", userId: "user-123", category: "Moradia", limitAmount: 4000, spentAmount: 3200, month: "2026-06" },
];

const INITIAL_INVESTMENTS: Investment[] = [
  { id: "i-1", userId: "user-123", name: "Tesouro IPCA+ 2035", category: "Renda Fixa", amount: 15000, yieldRate: "IPCA + 6.2%", date: "2024-03-10" },
  { id: "i-2", userId: "user-123", name: "CDB Banco Inter 102%", category: "Pós-Fixado", amount: 20000, yieldRate: "102% CDI", date: "2025-01-12" },
  { id: "i-3", userId: "user-123", name: "FII HGLG11 - Logística", category: "Fundos Imobiliários", amount: 12500, yieldRate: "0.85% am", date: "2024-09-05" },
  { id: "i-4", userId: "user-123", name: "Bitcoin ETF (QBTC11)", category: "Criptoativos", amount: 5000, yieldRate: "Variável", date: "2025-11-20" },
];

const INITIAL_CARDS: Card[] = [
  { id: "c-1", userId: "user-123", name: "NexFin Infinite Metal", limit: 30000, currentSpent: 4850, color: "from-[#00C8FF] to-[#00BFFF]", expiry: "12/32", lastFour: "8899" },
  { id: "c-2", userId: "user-123", name: "Black Mastercard", limit: 50000, currentSpent: 2150, color: "from-[#FF0F7B] to-[#FF4D4F]", expiry: "08/30", lastFour: "4321" },
];

const INITIAL_INSTALLMENTS: Installment[] = [
  { id: "ins-1", userId: "user-123", description: "iPhone 16 Pro Max", totalAmount: 9600, installmentsCount: 12, installmentAmount: 800, currentInstallment: 4, category: "Tecnologia", firstDueDate: "2026-03-10" },
  { id: "ins-2", userId: "user-123", description: "Notebook Gamer Rog", totalAmount: 12000, installmentsCount: 10, installmentAmount: 1200, currentInstallment: 8, category: "Tecnologia", firstDueDate: "2025-11-05" },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "n-1", userId: "user-123", type: "info", title: "Novo Acesso Detectado", message: "Acesso registrado de Mac OS - Chrome, São Paulo", date: "2026-06-24T18:30:00Z", read: false },
  { id: "n-2", userId: "user-123", type: "warning", title: "Conta Vencendo Logo", message: "A conta de Moradia no valor de R$ 350,00 vence em 4 dias.", date: "2026-06-24T10:15:00Z", read: false },
  { id: "n-3", userId: "user-123", type: "success", title: "Meta Atingida!", message: "Parabéns! Você alcançou 70% da sua meta Reserva de Emergência.", date: "2026-06-20T14:22:00Z", read: true },
];

const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: "ce-1", userId: "user-123", title: "Netflix Premium", amount: 55.90, type: "expense", date: "2026-06-01", status: "paid", isRecurring: true },
  { id: "ce-2", userId: "user-123", title: "Aluguel Central", amount: 3200, type: "expense", date: "2026-06-10", status: "paid", isRecurring: true },
  { id: "ce-3", userId: "user-123", title: "Recebimento Dividendos", amount: 1200, type: "income", date: "2026-06-15", status: "paid", isRecurring: true },
  { id: "ce-4", userId: "user-123", title: "Fatura Infinite Metal", amount: 4850, type: "expense", date: "2026-06-25", status: "paid", isRecurring: true },
  { id: "ce-5", userId: "user-123", title: "Energia Coelba", amount: 350, type: "expense", date: "2026-06-28", status: "pending", isRecurring: false },
  { id: "ce-6", userId: "user-123", title: "Salário Mensal", amount: 12500, type: "income", date: "2026-07-05", status: "pending", isRecurring: true },
];

const INITIAL_SCORE: FinancialScore = {
  id: "s-123",
  userId: "user-123",
  score: 84,
  details: {
    organization: 90,
    control: 85,
    savings: 80,
    reserve: 70,
    goals: 75,
    punctuality: 100,
  },
  suggestions: [
    "Aumente sua reserva de emergência para atingir a meta ideal de 6 meses de custos fixos.",
    "Suas assinaturas somam R$ 370/mês. Analise se há serviços que você não utiliza com frequência.",
    "Considere aumentar o aporte em investimentos para elevar a pontuação de Economia.",
  ],
};

const INITIAL_AI_HISTORY: AIHistoryItem[] = [
  { id: "ah-1", userId: "user-123", role: "model", content: "Olá Eduardo! Sou o NexFin AI. Posso ajudar você a analisar seus gastos, simular investimentos ou responder qualquer dúvida financeira.", timestamp: "2026-06-24T19:00:00Z" },
];

export class NexFinDatabase {
  private static getStored<T>(key: string, initial: T): T {
    if (typeof window === "undefined") return initial;
    const item = localStorage.getItem(`nexfin_${key}`);
    if (!item) {
      localStorage.setItem(`nexfin_${key}`, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(item);
  }

  private static setStored<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(`nexfin_${key}`, JSON.stringify(value));
    
    // Broadcast changes to other tabs to simulate Supabase Realtime synchronization!
    if (syncChannel) {
      syncChannel.postMessage({ key, value });
    }

    // Attempt automatic background sync to Supabase if logged in
    const activeUser = localStorage.getItem("nexfin_active_user");
    if (activeUser) {
      try {
        const user = JSON.parse(activeUser);
        this.pushSync(user.id).catch((err) => console.error("Auto background sync failed:", err));
      } catch (e) {}
    }
  }

  static async pushSync(userId: string): Promise<any> {
    if (typeof window === "undefined" || !userId) return { success: false };
    try {
      const profiles = this.getStored<UserProfile[]>("profiles", []);
      const profile = profiles.find(p => p.id === userId || p.email === userId) || null;

      const data = {
        profile,
        transactions: this.getStored<Transaction[]>("transactions", []).filter(t => t.userId === userId),
        goals: this.getStored<Goal[]>("goals", []).filter(g => g.userId === userId),
        budgets: this.getStored<Budget[]>("budgets", []).filter(b => b.userId === userId),
        investments: this.getStored<Investment[]>("investments", []).filter(i => i.userId === userId),
        cards: this.getStored<Card[]>("cards", []).filter(c => c.userId === userId),
        installments: this.getStored<Installment[]>("installments", []).filter(ins => ins.userId === userId),
        notifications: this.getStored<Notification[]>("notifications", []).filter(n => n.userId === userId),
        calendarEvents: this.getStored<CalendarEvent[]>("calendar_events", []).filter(ce => ce.userId === userId),
        score: this.getStored<FinancialScore[]>("score_list", []).find(s => s.userId === userId) || null,
        aiHistory: this.getStored<AIHistoryItem[]>("ai_history", []).filter(h => h.userId === userId),
        financialReports: this.getStored<FinancialReport[]>("financial_reports", []).filter(rep => rep.userId === userId),
      };

      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, data }),
      });
      return await response.json();
    } catch (e) {
      console.error("Failed to push sync:", e);
      return { success: false, error: e };
    }
  }

  static async pullSync(userId: string): Promise<any> {
    if (typeof window === "undefined" || !userId) return { success: false };
    try {
      const response = await fetch(`/api/sync?userId=${encodeURIComponent(userId)}`);
      const res = await response.json();
      
      if (res.success && res.synchronized && res.data) {
        const server = res.data;
        
        // Profiles
        if (server.profile) {
          const profiles = this.getStored<UserProfile[]>("profiles", []);
          const idx = profiles.findIndex(p => p.id === userId || p.email === userId);
          const mappedProfile: UserProfile = {
            id: server.profile.id,
            name: server.profile.name,
            email: server.profile.email,
            cpf: server.profile.cpf,
            avatar: server.profile.avatar,
            theme: server.profile.theme,
            language: server.profile.language,
            preferences: {
              notificationsEnabled: server.profile.notificationsEnabled,
              aiGrounding: server.profile.aiGrounding,
              realtimeSync: server.profile.realtimeSync,
            }
          };
          if (idx !== -1) {
            profiles[idx] = mappedProfile;
          } else {
            profiles.push(mappedProfile);
          }
          localStorage.setItem("nexfin_profiles", JSON.stringify(profiles));
        }

        // Transactions
        if (server.transactions) {
          const otherTxs = this.getStored<Transaction[]>("transactions", []).filter(t => t.userId !== userId);
          localStorage.setItem("nexfin_transactions", JSON.stringify([...otherTxs, ...server.transactions]));
        }

        // Goals
        if (server.goals) {
          const otherGoals = this.getStored<Goal[]>("goals", []).filter(g => g.userId !== userId);
          localStorage.setItem("nexfin_goals", JSON.stringify([...otherGoals, ...server.goals]));
        }

        // Budgets
        if (server.budgets) {
          const otherBudgets = this.getStored<Budget[]>("budgets", []).filter(b => b.userId !== userId);
          localStorage.setItem("nexfin_budgets", JSON.stringify([...otherBudgets, ...server.budgets]));
        }

        // Investments
        if (server.investments) {
          const otherInvestments = this.getStored<Investment[]>("investments", []).filter(i => i.userId !== userId);
          localStorage.setItem("nexfin_investments", JSON.stringify([...otherInvestments, ...server.investments]));
        }

        // Cards
        if (server.cards) {
          const otherCards = this.getStored<Card[]>("cards", []).filter(c => c.userId !== userId);
          localStorage.setItem("nexfin_cards", JSON.stringify([...otherCards, ...server.cards]));
        }

        // Installments
        if (server.installments) {
          const otherInstallments = this.getStored<Installment[]>("installments", []).filter(ins => ins.userId !== userId);
          localStorage.setItem("nexfin_installments", JSON.stringify([...otherInstallments, ...server.installments]));
        }

        // Notifications
        if (server.notifications) {
          const otherNotifications = this.getStored<Notification[]>("notifications", []).filter(n => n.userId !== userId);
          localStorage.setItem("nexfin_notifications", JSON.stringify([...otherNotifications, ...server.notifications]));
        }

        // Calendar Events
        if (server.calendarEvents) {
          const otherEvents = this.getStored<CalendarEvent[]>("calendar_events", []).filter(ce => ce.userId !== userId);
          localStorage.setItem("nexfin_calendar_events", JSON.stringify([...otherEvents, ...server.calendarEvents]));
        }

        // Score
        if (server.score) {
          const otherScores = this.getStored<FinancialScore[]>("score_list", []).filter(s => s.userId !== userId);
          const mappedScore: FinancialScore = {
            id: server.score.id,
            userId: server.score.userId,
            score: server.score.score,
            details: {
              organization: server.score.organization,
              control: server.score.control,
              savings: server.score.savings,
              reserve: server.score.reserve,
              goals: server.score.goals,
              punctuality: server.score.punctuality,
            },
            suggestions: server.score.suggestions,
          };
          localStorage.setItem("nexfin_score_list", JSON.stringify([...otherScores, mappedScore]));
        }

        // AI History
        if (server.aiHistory) {
          const otherHistory = this.getStored<AIHistoryItem[]>("ai_history", []).filter(h => h.userId !== userId);
          localStorage.setItem("nexfin_ai_history", JSON.stringify([...otherHistory, ...server.aiHistory]));
        }

        // Financial Reports
        if (server.financialReports) {
          const otherReports = this.getStored<FinancialReport[]>("financial_reports", []).filter(rep => rep.userId !== userId);
          localStorage.setItem("nexfin_financial_reports", JSON.stringify([...otherReports, ...server.financialReports]));
        }

        // Trigger local BroadcastChannel event so other tabs/listeners update
        if (syncChannel) {
          syncChannel.postMessage({ key: "__all__", value: Date.now() });
        }
        return { success: true, synchronized: true };
      }
      return res;
    } catch (e) {
      console.error("Failed to pull sync:", e);
      return { success: false, error: e };
    }
  }

  static initializeChannel(onSync: (key: string, value: any) => void) {
    if (syncChannel) {
      syncChannel.onmessage = (event) => {
        const { key, value } = event.data;
        onSync(key, value);
      };
    }
  }

  static ensureUserSeeded(userId: string) {
    if (typeof window === "undefined" || !userId) return;
    const seededKey = `nexfin_seeded_${userId}`;
    if (localStorage.getItem(seededKey)) return;

    // EVERY user starts completely empty, clean and zeroed out.
    // No mock data, no fictive balances, no example transactions, etc.
    this.setStored("transactions", this.getStored<Transaction[]>("transactions", []).filter(t => t.userId !== userId));
    this.setStored("goals", this.getStored<Goal[]>("goals", []).filter(g => g.userId !== userId));
    this.setStored("budgets", this.getStored<Budget[]>("budgets", []).filter(b => b.userId !== userId));
    this.setStored("investments", this.getStored<Investment[]>("investments", []).filter(i => i.userId !== userId));
    this.setStored("cards", this.getStored<Card[]>("cards", []).filter(c => c.userId !== userId));
    this.setStored("installments", this.getStored<Installment[]>("installments", []).filter(ins => ins.userId !== userId));
    this.setStored("notifications", this.getStored<Notification[]>("notifications", []).filter(n => n.userId !== userId));
    this.setStored("calendar_events", this.getStored<CalendarEvent[]>("calendar_events", []).filter(ce => ce.userId !== userId));
    
    const scores = this.getStored<FinancialScore[]>("score_list", []);
    const userScore = scores.find(s => s.userId === userId);
    if (!userScore) {
      scores.push({
        id: "s-" + userId,
        userId,
        score: 0, // Clean slate starts at 0
        details: {
          organization: 0,
          control: 0,
          savings: 0,
          reserve: 0,
          goals: 0,
          punctuality: 0,
        },
        suggestions: ["Bem-vindo ao NexFin! Cadastre suas primeiras receitas ou despesas para iniciar as análises de Inteligência Artificial."]
      });
      this.setStored("score_list", scores);
    }

    const aiHistory = this.getStored<AIHistoryItem[]>("ai_history", []);
    const userAiHistory = aiHistory.filter(ai => ai.userId === userId);
    if (userAiHistory.length === 0) {
      aiHistory.push({
        id: "ah-" + Math.random().toString(36).substring(2, 9),
        userId,
        role: "model",
        content: "Olá! Bem-vindo ao NexFin. Sou o seu consultor financeiro pessoal de IA. Atualmente, seu painel está completamente limpo e pronto para suas finanças reais. Como posso te ajudar hoje?",
        timestamp: new Date().toISOString()
      });
      this.setStored("ai_history", aiHistory);
    }

    localStorage.setItem(seededKey, "true");
  }

  // Clear/Reset Dashboard - Completely clears everything (fully zeroed account) and pushes to Supabase!
  static clearAll(userId: string) {
    const filterOutUser = <T extends { userId: string }>(key: string) => {
      const list = this.getStored<T[]>(key, []);
      const filtered = list.filter(item => item.userId !== userId);
      this.setStored(key, filtered);
    };

    filterOutUser<Transaction>("transactions");
    filterOutUser<Goal>("goals");
    filterOutUser<Budget>("budgets");
    filterOutUser<Investment>("investments");
    filterOutUser<Card>("cards");
    filterOutUser<Installment>("installments");
    filterOutUser<Notification>("notifications");
    filterOutUser<CalendarEvent>("calendar_events");
    filterOutUser<AIHistoryItem>("ai_history");
    filterOutUser<FinancialReport>("financial_reports");

    // Reset score to clean 0
    const scores = this.getStored<FinancialScore[]>("score_list", []);
    const filteredScores = scores.filter(s => s.userId !== userId);
    filteredScores.push({
      id: "s-" + userId,
      userId,
      score: 0,
      details: {
        organization: 0,
        control: 0,
        savings: 0,
        reserve: 0,
        goals: 0,
        punctuality: 0,
      },
      suggestions: ["Conta redefinida com sucesso. Todos os registros foram zerados."]
    });
    this.setStored("score_list", filteredScores);

    // Sync the cleared state directly to Supabase
    this.pushSync(userId).catch(err => console.error("Cloud reset push sync failed:", err));
  }

  // Profile operations
  static getProfile(userId: string): UserProfile {
    this.ensureUserSeeded(userId);
    const profiles = this.getStored<UserProfile[]>("profiles", [DEFAULT_PROFILE]);
    let found = profiles.find((p) => p.id === userId || p.email === userId);
    if (!found) {
      found = { ...DEFAULT_PROFILE, id: userId, email: userId };
      profiles.push(found);
      this.setStored("profiles", profiles);
    }
    return found;
  }

  static updateProfile(userId: string, data: Partial<UserProfile>): UserProfile {
    const profiles = this.getStored<UserProfile[]>("profiles", [DEFAULT_PROFILE]);
    const index = profiles.findIndex((p) => p.id === userId || p.email === userId);
    if (index !== -1) {
      profiles[index] = { ...profiles[index], ...data };
      this.setStored("profiles", profiles);
      return profiles[index];
    }
    const newProfile = { ...DEFAULT_PROFILE, id: userId, ...data };
    profiles.push(newProfile);
    this.setStored("profiles", profiles);
    return newProfile;
  }

  // Transaction operations
  static getTransactions(userId: string): Transaction[] {
    this.ensureUserSeeded(userId);
    const list = this.getStored<Transaction[]>("transactions", []);
    return list.filter((t) => t.userId === userId);
  }

  static addTransaction(userId: string, item: Omit<Transaction, "id" | "userId">): Transaction {
    const list = this.getStored<Transaction[]>("transactions", []);
    const newItem: Transaction = {
      ...item,
      id: "t-" + Date.now(),
      userId,
    };
    list.unshift(newItem);
    this.setStored("transactions", list);

    // Update budget spent automatically
    this.updateBudgetSpent(userId, item.category);
    // Recalculate score
    this.recalculateScore(userId);

    return newItem;
  }

  static deleteTransaction(userId: string, id: string): void {
    let list = this.getStored<Transaction[]>("transactions", []);
    const item = list.find(t => t.id === id);
    list = list.filter((t) => t.id !== id);
    this.setStored("transactions", list);
    if (item) {
      this.updateBudgetSpent(userId, item.category);
      this.recalculateScore(userId);
    }
  }

  // Goals operations
  static getGoals(userId: string): Goal[] {
    this.ensureUserSeeded(userId);
    const list = this.getStored<Goal[]>("goals", []);
    return list.filter((g) => g.userId === userId);
  }

  static addGoal(userId: string, item: Omit<Goal, "id" | "userId">): Goal {
    const list = this.getStored<Goal[]>("goals", []);
    const newItem: Goal = {
      ...item,
      id: "g-" + Date.now(),
      userId,
    };
    list.push(newItem);
    this.setStored("goals", list);
    this.recalculateScore(userId);
    return newItem;
  }

  static updateGoalProgress(userId: string, id: string, amount: number): void {
    const list = this.getStored<Goal[]>("goals", []);
    const index = list.findIndex((g) => g.id === id);
    if (index !== -1) {
      list[index].currentAmount = Math.min(list[index].targetAmount, list[index].currentAmount + amount);
      this.setStored("goals", list);
      this.recalculateScore(userId);
    }
  }

  // Budgets operations
  static getBudgets(userId: string): Budget[] {
    this.ensureUserSeeded(userId);
    const list = this.getStored<Budget[]>("budgets", []);
    return list.filter((b) => b.userId === userId);
  }

  static addBudget(userId: string, item: Omit<Budget, "id" | "userId" | "spentAmount">): Budget {
    const list = this.getStored<Budget[]>("budgets", []);
    const newItem: Budget = {
      ...item,
      id: "b-" + Date.now(),
      userId,
      spentAmount: 0,
    };
    list.push(newItem);
    this.setStored("budgets", list);
    this.updateBudgetSpent(userId, item.category);
    return newItem;
  }

  private static updateBudgetSpent(userId: string, category: string) {
    const budgets = this.getStored<Budget[]>("budgets", []);
    const txs = this.getTransactions(userId);
    
    // Calculate total spent in this category for current month
    const spent = txs
      .filter(t => t.type === "expense" && t.category.toLowerCase() === category.toLowerCase())
      .reduce((sum, t) => sum + t.amount, 0);

    const index = budgets.findIndex(b => b.category.toLowerCase() === category.toLowerCase());
    if (index !== -1) {
      budgets[index].spentAmount = spent;
      this.setStored("budgets", budgets);
    }
  }

  // Investments operations
  static getInvestments(userId: string): Investment[] {
    this.ensureUserSeeded(userId);
    const list = this.getStored<Investment[]>("investments", []);
    return list.filter((i) => i.userId === userId);
  }

  static addInvestment(userId: string, item: Omit<Investment, "id" | "userId">): Investment {
    const list = this.getStored<Investment[]>("investments", []);
    const newItem: Investment = {
      ...item,
      id: "i-" + Date.now(),
      userId,
    };
    list.push(newItem);
    this.setStored("investments", list);
    this.recalculateScore(userId);
    return newItem;
  }

  // Cards operations
  static getCards(userId: string): Card[] {
    this.ensureUserSeeded(userId);
    const list = this.getStored<Card[]>("cards", []);
    return list.filter((c) => c.userId === userId);
  }

  static addCard(userId: string, item: Omit<Card, "id" | "userId"> & { currentSpent?: number }): Card {
    const list = this.getStored<Card[]>("cards", []);
    const newItem: Card = {
      ...item,
      id: "c-" + Date.now(),
      userId,
      currentSpent: item.currentSpent ?? 0,
    };
    list.push(newItem);
    this.setStored("cards", list);
    return newItem;
  }

  static updateCard(userId: string, id: string, updatedFields: Partial<Card>): Card | null {
    const list = this.getStored<Card[]>("cards", []);
    const index = list.findIndex((c) => c.id === id);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        ...updatedFields,
      };
      this.setStored("cards", list);
      return list[index];
    }
    return null;
  }

  static deleteCard(userId: string, id: string): boolean {
    const list = this.getStored<Card[]>("cards", []);
    const filtered = list.filter((c) => c.id !== id);
    if (filtered.length !== list.length) {
      this.setStored("cards", filtered);
      return true;
    }
    return false;
  }

  // Installments operations
  static getInstallments(userId: string): Installment[] {
    this.ensureUserSeeded(userId);
    const list = this.getStored<Installment[]>("installments", []);
    return list.filter((i) => i.userId === userId);
  }

  static addInstallment(userId: string, item: Omit<Installment, "id" | "userId" | "currentInstallment">): Installment {
    const list = this.getStored<Installment[]>("installments", []);
    const newItem: Installment = {
      ...item,
      id: "ins-" + Date.now(),
      userId,
      currentInstallment: 1,
    };
    list.push(newItem);
    this.setStored("installments", list);
    this.recalculateScore(userId);
    return newItem;
  }

  // Notifications operations
  static getNotifications(userId: string): Notification[] {
    this.ensureUserSeeded(userId);
    const list = this.getStored<Notification[]>("notifications", []);
    return list.filter((n) => n.userId === userId);
  }

  static addNotification(userId: string, type: Notification["type"], title: string, message: string): Notification {
    const list = this.getStored<Notification[]>("notifications", []);
    const newItem: Notification = {
      id: "n-" + Date.now(),
      userId,
      type,
      title,
      message,
      date: new Date().toISOString(),
      read: false,
    };
    list.unshift(newItem);
    this.setStored("notifications", list);
    return newItem;
  }

  static markNotificationsAsRead(userId: string): void {
    const list = this.getStored<Notification[]>("notifications", []);
    const updated = list.map((n) => (n.userId === userId ? { ...n, read: true } : n));
    this.setStored("notifications", updated);
  }

  // Calendar Events operations
  static getCalendarEvents(userId: string): CalendarEvent[] {
    this.ensureUserSeeded(userId);
    const list = this.getStored<CalendarEvent[]>("calendar_events", []);
    return list.filter((e) => e.userId === userId);
  }

  static addCalendarEvent(userId: string, item: Omit<CalendarEvent, "id" | "userId">): CalendarEvent {
    const list = this.getStored<CalendarEvent[]>("calendar_events", []);
    const newItem: CalendarEvent = {
      ...item,
      id: "ce-" + Date.now(),
      userId,
    };
    list.push(newItem);
    this.setStored("calendar_events", list);
    
    // Add transaction automatically if status is paid
    if (item.status === "paid") {
      this.addTransaction(userId, {
        type: item.type,
        category: "Agendamento",
        amount: item.amount,
        description: item.title,
        date: item.date,
        status: "paid",
      });
    }

    return newItem;
  }

  static toggleCalendarEventStatus(userId: string, id: string): CalendarEvent | null {
    const list = this.getStored<CalendarEvent[]>("calendar_events", []);
    const index = list.findIndex(e => e.id === id);
    if (index !== -1) {
      const event = list[index];
      const newStatus = event.status === "paid" ? "pending" : "paid";
      list[index].status = newStatus;
      this.setStored("calendar_events", list);

      if (newStatus === "paid") {
        this.addTransaction(userId, {
          type: event.type,
          category: "Calendário",
          amount: event.amount,
          description: event.title,
          date: event.date,
          status: "paid",
        });
      }
      return list[index];
    }
    return null;
  }

  static deleteCalendarEvent(userId: string, id: string): boolean {
    const list = this.getStored<CalendarEvent[]>("calendar_events", []);
    const filtered = list.filter((e) => e.id !== id);
    if (filtered.length !== list.length) {
      this.setStored("calendar_events", filtered);
      return true;
    }
    return false;
  }

  // AI History operations
  static getAiHistory(userId: string): AIHistoryItem[] {
    this.ensureUserSeeded(userId);
    const list = this.getStored<AIHistoryItem[]>("ai_history", []);
    return list.filter((ai) => ai.userId === userId);
  }

  static addAiHistory(userId: string, role: "user" | "model", content: string): AIHistoryItem {
    const list = this.getStored<AIHistoryItem[]>("ai_history", []);
    const newItem: AIHistoryItem = {
      id: "ah-" + Date.now(),
      userId,
      role,
      content,
      timestamp: new Date().toISOString(),
    };
    list.push(newItem);
    this.setStored("ai_history", list);
    return newItem;
  }

  static clearAiHistory(userId: string): void {
    const list = this.getStored<AIHistoryItem[]>("ai_history", []);
    const filtered = list.filter((ai) => ai.userId !== userId);
    this.setStored("ai_history", filtered);
  }

  // Financial Report operations
  static getReports(userId: string): FinancialReport[] {
    this.ensureUserSeeded(userId);
    return this.getStored<FinancialReport[]>("financial_reports", []).filter((rep) => rep.userId === userId);
  }

  static addReport(userId: string, rep: Omit<FinancialReport, "id" | "userId">): FinancialReport {
    const list = this.getStored<FinancialReport[]>("financial_reports", []);
    const newItem: FinancialReport = {
      ...rep,
      id: "rep-" + Date.now(),
      userId,
    };
    list.unshift(newItem);
    this.setStored("financial_reports", list);
    return newItem;
  }

  // Financial Score operations
  static getScore(userId: string): FinancialScore {
    const list = this.getStored<FinancialScore[]>("score_list", []);
    const found = list.find(s => s.userId === userId);
    if (!found) {
      const defaultScore: FinancialScore = {
        id: "s-" + userId,
        userId,
        score: 0, // Clean slate starts at 0
        details: {
          organization: 0,
          control: 0,
          savings: 0,
          reserve: 0,
          goals: 0,
          punctuality: 0,
        },
        suggestions: ["Bem-vindo ao NexFin! Cadastre suas primeiras receitas ou despesas para iniciar as análises de Inteligência Artificial."]
      };
      list.push(defaultScore);
      this.setStored("score_list", list);
      return defaultScore;
    }
    return found;
  }

  private static recalculateScore(userId: string) {
    const txs = this.getTransactions(userId);
    const goals = this.getGoals(userId);
    const budgets = this.getBudgets(userId);
    const investments = this.getInvestments(userId);
    const calendarEvents = this.getCalendarEvents(userId);

    // Math metrics
    const incomeTotal = txs.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expenseTotal = txs.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    
    // 1. Organization: ratio of structured events categorized
    const orgScore = budgets.length > 0 ? Math.min(100, Math.max(50, 70 + (budgets.length * 5))) : 0;
    
    // 2. Control: ratio of expense to income
    const ratio = incomeTotal > 0 ? expenseTotal / incomeTotal : 0;
    const controlScore = incomeTotal > 0 ? Math.min(100, Math.max(20, Math.round((1 - ratio) * 100))) : 0;

    // 3. Savings: proportion of investments
    const investSum = investments.reduce((sum, i) => sum + i.amount, 0);
    const savingsScore = investSum > 0 ? Math.min(100, Math.max(40, Math.round(50 + (investSum / 2000)))) : 0;

    // 4. Reserve: target emergency goal progress
    const reserveGoal = goals.find(g => g.name.toLowerCase().includes("reserva"));
    const reserveScore = reserveGoal ? Math.round((reserveGoal.currentAmount / reserveGoal.targetAmount) * 100) : 0;

    // 5. Goals: average of all goals progress
    const goalsProgress = goals.length > 0 
      ? Math.round(goals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount * 100), 0) / goals.length)
      : 0;

    // 6. Punctuality: status of scheduled bills
    const totalBills = calendarEvents.filter(e => e.type === "expense").length;
    const unpaidBills = calendarEvents.filter(e => e.type === "expense" && e.status === "pending").length;
    const punctualityScore = totalBills > 0 ? (unpaidBills === 0 ? 100 : Math.max(50, 100 - (unpaidBills * 10))) : 0;

    const activeFactors = [orgScore, controlScore, savingsScore, reserveScore, goalsProgress, punctualityScore].filter(f => f > 0);
    const finalScore = activeFactors.length > 0 ? Math.round(activeFactors.reduce((sum, f) => sum + f, 0) / activeFactors.length) : 0;

    const suggestions = [];
    if (finalScore < 90 && txs.length > 0) {
      if (punctualityScore < 100) suggestions.push("Você tem contas pendentes agendadas para vencer. Efetue o pagamento para evitar juros ou juros de mora.");
      if (reserveScore < 80) suggestions.push("Sua Reserva de Emergência está abaixo do ideal. Considere reservar uma fatia menor de despesas.");
      if (controlScore < 70) suggestions.push("Seu volume de despesas em relação às receitas é alto. Que tal buscar economias extras?");
    } else if (txs.length > 0) {
      suggestions.push("Excelente organização financeira! Continue controlando suas despesas e investimentos de forma consciente.");
    } else {
      suggestions.push("Bem-vindo ao NexFin! Cadastre suas primeiras receitas ou despesas para iniciar as análises de Inteligência Artificial.");
    }

    const list = this.getStored<FinancialScore[]>("score_list", []);
    const index = list.findIndex(s => s.userId === userId);
    const scoreObj: FinancialScore = {
      id: "s-" + Date.now(),
      userId,
      score: finalScore,
      details: {
        organization: orgScore,
        control: controlScore,
        savings: savingsScore,
        reserve: reserveScore,
        goals: goalsProgress,
        punctuality: punctualityScore,
      },
      suggestions,
    };

    if (index !== -1) {
      list[index] = scoreObj;
    } else {
      list.push(scoreObj);
    }
    this.setStored("score_list", list);
  }
}
