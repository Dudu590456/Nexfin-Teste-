import fs from "fs";
import path from "path";

export interface ServerUserProfile {
  id: string;
  name: string;
  email: string;
  cpf: string;
  avatar: string;
  password: string;
  theme: "dark" | "light";
  language: "pt" | "en";
  preferences: {
    notificationsEnabled: boolean;
    aiGrounding: boolean;
    realtimeSync: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserDataPayload {
  profile?: Partial<ServerUserProfile>;
  transactions?: any[];
  goals?: any[];
  budgets?: any[];
  investments?: any[];
  attachments?: any[];
  cards?: any[];
  installments?: any[];
  notifications?: any[];
  calendarEvents?: any[];
  score?: any;
  aiHistory?: any[];
  financialReports?: any[];
  notes?: any[];
  checklists?: any[];
  [key: string]: any;
}

interface VaultData {
  users: ServerUserProfile[];
  userData: Record<string, UserDataPayload>;
  version: number;
}

const DATA_DIR = path.join(process.cwd(), "data");
const VAULT_FILE = path.join(DATA_DIR, "server_vault.json");

// In-memory cache for speed
let inMemoryVault: VaultData | null = null;

function ensureDataDirectory() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error("[ServerStore] Error creating data directory:", err);
  }
}

function getDefaultVault(): VaultData {
  const defaultUser: ServerUserProfile = {
    id: "user-123",
    name: "Eduardo Rocha",
    email: "edu.rocha785@gmail.com",
    cpf: "123.456.789-00",
    avatar: "https://picsum.photos/seed/eduardo/150/150",
    password: "123456",
    theme: "dark",
    language: "pt",
    preferences: {
      notificationsEnabled: true,
      aiGrounding: true,
      realtimeSync: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    users: [defaultUser],
    userData: {
      "user-123": {
        profile: defaultUser,
        transactions: [],
        goals: [],
        budgets: [],
        investments: [],
        cards: [],
        installments: [],
        notifications: [],
        calendarEvents: [],
        score: {
          id: "s-user-123",
          userId: "user-123",
          score: 0,
          details: {
            organization: 0,
            control: 0,
            savings: 0,
            reserve: 0,
            goals: 0,
            punctuality: 0,
          },
          suggestions: [
            "Bem-vindo ao NexFin! Cadastre suas primeiras receitas ou despesas para iniciar as análises de Inteligência Artificial.",
          ],
        },
        aiHistory: [
          {
            id: "ah-welcome",
            userId: "user-123",
            role: "model",
            content:
              "Olá Eduardo! Sou seu assistente de inteligência financeira NexFin. Como posso te ajudar hoje?",
            timestamp: new Date().toISOString(),
          },
        ],
        financialReports: [],
        notes: [],
        checklists: [],
      },
    },
    version: 1,
  };
}

export class ServerStore {
  private static loadVault(): VaultData {
    if (inMemoryVault) return inMemoryVault;

    ensureDataDirectory();

    if (fs.existsSync(VAULT_FILE)) {
      try {
        const raw = fs.readFileSync(VAULT_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users)) {
          inMemoryVault = parsed;
          // Ensure default demo user exists
          if (!inMemoryVault!.users.some((u) => u.email === "edu.rocha785@gmail.com")) {
            const def = getDefaultVault();
            inMemoryVault!.users.push(def.users[0]);
            inMemoryVault!.userData[def.users[0].id] = def.userData[def.users[0].id];
            this.persistVault(inMemoryVault!);
          }
          return inMemoryVault!;
        }
      } catch (err) {
        console.error("[ServerStore] Error reading vault file, fallback to defaults:", err);
      }
    }

    inMemoryVault = getDefaultVault();
    this.persistVault(inMemoryVault);
    return inMemoryVault;
  }

  private static persistVault(data: VaultData) {
    try {
      ensureDataDirectory();
      inMemoryVault = data;
      const tmpFile = `${VAULT_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), "utf-8");
      fs.renameSync(tmpFile, VAULT_FILE);
    } catch (err) {
      console.error("[ServerStore] Error persisting vault:", err);
      // Fallback direct write
      try {
        fs.writeFileSync(VAULT_FILE, JSON.stringify(data, null, 2), "utf-8");
      } catch (directErr) {
        console.error("[ServerStore] Direct write fallback also failed:", directErr);
      }
    }
  }

  static findUserByEmail(email: string): ServerUserProfile | null {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    const vault = this.loadVault();
    return vault.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  }

  static findUserById(id: string): ServerUserProfile | null {
    if (!id) return null;
    const vault = this.loadVault();
    return vault.users.find((u) => u.id === id) || null;
  }

  static registerUser(params: {
    id?: string;
    name: string;
    email: string;
    cpf?: string;
    password: string;
  }): { success: boolean; user?: Omit<ServerUserProfile, "password">; error?: string; alreadyExists?: boolean } {
    const { id, name, email, cpf, password } = params;
    if (!email || !password) {
      return { success: false, error: "E-mail e senha são obrigatórios." };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || "").trim() || cleanEmail.split("@")[0] || "Usuário";
    const cleanCpf = (cpf || "").trim();

    const vault = this.loadVault();
    const existingIndex = vault.users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

    if (existingIndex !== -1) {
      const existing = vault.users[existingIndex];
      // Update password and profile details if provided
      existing.password = password;
      if (cleanName && cleanName !== "Usuário") existing.name = cleanName;
      if (cleanCpf) existing.cpf = cleanCpf;
      existing.updatedAt = new Date().toISOString();
      vault.users[existingIndex] = existing;
      this.persistVault(vault);

      const { password: _, ...safeUser } = existing;
      return { success: true, user: safeUser, alreadyExists: true };
    }

    const userId = id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const avatar = `https://picsum.photos/seed/${cleanName.split(" ")[0].toLowerCase()}/150/150`;

    const newUser: ServerUserProfile = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      cpf: cleanCpf,
      avatar,
      password,
      theme: "dark",
      language: "pt",
      preferences: {
        notificationsEnabled: true,
        aiGrounding: true,
        realtimeSync: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vault.users.push(newUser);

    // Initialize user data structure
    if (!vault.userData[userId]) {
      vault.userData[userId] = {
        profile: newUser,
        transactions: [],
        goals: [],
        budgets: [],
        investments: [],
        cards: [],
        installments: [],
        notifications: [],
        calendarEvents: [],
        score: {
          id: `s-${userId}`,
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
          suggestions: [
            "Bem-vindo ao NexFin! Cadastre suas primeiras receitas ou despesas para iniciar as análises.",
          ],
        },
        aiHistory: [
          {
            id: `ah-${userId}`,
            userId,
            role: "model",
            content: `Olá ${cleanName}! Sua conta foi cadastrada com sucesso e está pronta para uso em qualquer aparelho (celular ou computador). Como posso te ajudar hoje?`,
            timestamp: new Date().toISOString(),
          },
        ],
        financialReports: [],
        notes: [],
        checklists: [],
      };
    }

    this.persistVault(vault);

    const { password: _, ...safeUser } = newUser;
    return { success: true, user: safeUser };
  }

  static authenticateUser(
    email: string,
    password: string
  ): {
    success: boolean;
    status: number;
    user?: Omit<ServerUserProfile, "password">;
    data?: UserDataPayload;
    error?: string;
  } {
    if (!email || !password) {
      return { success: false, status: 400, error: "E-mail e senha são obrigatórios." };
    }

    const cleanEmail = email.trim().toLowerCase();
    const vault = this.loadVault();
    let user = vault.users.find((u) => u.email.toLowerCase() === cleanEmail);

    // Special auto-seed for demo account
    if (!user && cleanEmail === "edu.rocha785@gmail.com") {
      const reg = this.registerUser({
        id: "user-123",
        name: "Eduardo Rocha",
        email: "edu.rocha785@gmail.com",
        cpf: "123.456.789-00",
        password: password || "123456",
      });
      user = vault.users.find((u) => u.email.toLowerCase() === cleanEmail);
    }

    if (!user) {
      return {
        success: false,
        status: 404,
        error: "Nenhuma conta cadastrada com este e-mail. Crie sua conta na aba 'Criar Conta'.",
      };
    }

    // Verify password (or allow demo account flex)
    const isDemoFlex = cleanEmail === "edu.rocha785@gmail.com" && (password === "123456" || password.length >= 6);
    if (user.password !== password && !isDemoFlex) {
      return {
        success: false,
        status: 401,
        error: "Senha incorreta. Verifique sua senha ou clique em 'Esqueceu a senha?'.",
      };
    }

    // If demo account entered new password, update it
    if (isDemoFlex && user.password !== password) {
      user.password = password;
      user.updatedAt = new Date().toISOString();
      this.persistVault(vault);
    }

    const userData = vault.userData[user.id] || {
      profile: user,
      transactions: [],
      goals: [],
      budgets: [],
      investments: [],
      cards: [],
      installments: [],
      notifications: [],
      calendarEvents: [],
      score: null,
      aiHistory: [],
      financialReports: [],
      notes: [],
      checklists: [],
    };

    const { password: _, ...safeUser } = user;
    return {
      success: true,
      status: 200,
      user: safeUser,
      data: userData,
    };
  }

  static updateUserPassword(email: string, newPassword: string): boolean {
    if (!email || !newPassword) return false;
    const cleanEmail = email.trim().toLowerCase();
    const vault = this.loadVault();
    const user = vault.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) return false;

    user.password = newPassword;
    user.updatedAt = new Date().toISOString();
    this.persistVault(vault);
    return true;
  }

  static getUserData(userId: string): UserDataPayload | null {
    if (!userId) return null;
    const vault = this.loadVault();
    return vault.userData[userId] || null;
  }

  static saveUserData(userId: string, incomingData: UserDataPayload): boolean {
    if (!userId || !incomingData) return false;
    const vault = this.loadVault();

    const existing = vault.userData[userId] || {
      profile: undefined,
      transactions: [],
      goals: [],
      budgets: [],
      investments: [],
      cards: [],
      installments: [],
      notifications: [],
      calendarEvents: [],
      score: null,
      aiHistory: [],
      financialReports: [],
      notes: [],
      checklists: [],
    };

    // Update fields
    if (incomingData.profile) {
      existing.profile = { ...existing.profile, ...incomingData.profile };
      // Also update in users array
      const uIndex = vault.users.findIndex((u) => u.id === userId);
      if (uIndex !== -1) {
        vault.users[uIndex] = {
          ...vault.users[uIndex],
          ...(incomingData.profile as any),
          updatedAt: new Date().toISOString(),
        };
      }
    }

    if (Array.isArray(incomingData.transactions)) existing.transactions = incomingData.transactions;
    if (Array.isArray(incomingData.goals)) existing.goals = incomingData.goals;
    if (Array.isArray(incomingData.budgets)) existing.budgets = incomingData.budgets;
    if (Array.isArray(incomingData.investments)) existing.investments = incomingData.investments;
    if (Array.isArray(incomingData.cards)) existing.cards = incomingData.cards;
    if (Array.isArray(incomingData.installments)) existing.installments = incomingData.installments;
    if (Array.isArray(incomingData.notifications)) existing.notifications = incomingData.notifications;
    if (Array.isArray(incomingData.calendarEvents)) existing.calendarEvents = incomingData.calendarEvents;
    if (incomingData.score !== undefined) existing.score = incomingData.score;
    if (Array.isArray(incomingData.aiHistory)) existing.aiHistory = incomingData.aiHistory;
    if (Array.isArray(incomingData.financialReports)) existing.financialReports = incomingData.financialReports;
    if (Array.isArray(incomingData.notes)) existing.notes = incomingData.notes;
    if (Array.isArray(incomingData.checklists)) existing.checklists = incomingData.checklists;

    vault.userData[userId] = existing;
    this.persistVault(vault);
    return true;
  }
}
