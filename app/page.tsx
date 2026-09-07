"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Home, TrendingUp, Calendar, CreditCard, FileText, Target, FilePieChart, Bot, User, 
  Search, Bell, Settings, Trash2, Plus, Sparkles, Check, RefreshCw, X, LogOut, CheckCircle2, 
  ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Download, Upload, HelpCircle, Edit2, Printer, Copy, AlertTriangle,
  Menu, Mic 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  NexFinDatabase, UserProfile, Transaction, Goal, Budget, Investment, 
  Notification, CalendarEvent, Card, Installment, FinancialScore, AIHistoryItem, FinancialReport 
} from "@/lib/database";
import AuthScreen from "@/components/AuthScreen";
import Onboarding from "@/components/Onboarding";
import ScoreCard from "@/components/ScoreCard";
import RadarAlerts, { SmartAlert } from "@/components/RadarAlerts";
import LossPanel, { LossAnalysisData } from "@/components/LossPanel";
import Sidebar from "@/components/Sidebar";
import SpeedDial from "@/components/SpeedDial";
import VoiceModal from "@/components/VoiceModal";
import PrintableReportModal from "@/components/PrintableReportModal";
import AddForms from "@/components/AddForms";
import AiChat from "@/components/AiChat";

// Helpers for bank logos and card brand flags on physical design
const renderBankLogo = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("nubank") || n.includes("nu ")) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-black text-purple-200 bg-white/10 px-2 py-0.5 rounded border border-white/10 font-sans">Nu</span>
        <span className="text-[9px] font-mono tracking-widest text-white/70 font-bold">NUBANK</span>
      </div>
    );
  }
  if (n.includes("itau") || n.includes("itaú")) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 bg-[#002d72] text-[#ff7000] font-black rounded flex items-center justify-center text-[10px] font-sans border border-orange-500/30">it</div>
        <span className="text-[9px] font-mono tracking-widest text-white/70 font-bold">ITAÚ</span>
      </div>
    );
  }
  if (n.includes("bradesco")) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 bg-[#CC092F] text-white font-black rounded flex items-center justify-center text-[10px] font-sans border border-white/20">B</div>
        <span className="text-[9px] font-mono tracking-widest text-white/70 font-bold">BRADESCO</span>
      </div>
    );
  }
  if (n.includes("santander")) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-serif font-black text-red-500 bg-white w-5 h-5 rounded-full flex items-center justify-center">S</span>
        <span className="text-[9px] font-mono tracking-widest text-white/70 font-bold">SANTANDER</span>
      </div>
    );
  }
  if (n.includes("inter")) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-black text-black bg-[#FF7A00] px-1.5 py-0.5 rounded font-sans border border-white/20">inter</span>
        <span className="text-[9px] font-mono tracking-widest text-white/70 font-bold">INTER</span>
      </div>
    );
  }
  if (n.includes("c6")) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-black text-white bg-black/60 border border-white/10 px-1.5 py-0.5 rounded font-sans tracking-tight">C6 BANK</span>
      </div>
    );
  }
  if (n.includes("caixa")) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 bg-[#005ca9] text-[#f47920] font-black rounded flex items-center justify-center text-xs font-sans">X</div>
        <span className="text-[9px] font-mono tracking-widest text-white/70 font-bold">CAIXA</span>
      </div>
    );
  }
  if (n.includes("brasil") || n.includes("bb") || n.includes("banco do brasil")) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 bg-[#FFE600] text-blue-900 font-black rounded-sm flex items-center justify-center text-[10px] font-mono">BB</div>
        <span className="text-[9px] font-mono tracking-widest text-[#FFE600]/80 font-bold">BANCO DO BRASIL</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-5 h-5 bg-white/10 text-white rounded flex items-center justify-center text-[10px] font-bold">⚡</div>
      <span className="text-[9px] font-mono tracking-widest text-white/80 uppercase font-bold">{name}</span>
    </div>
  );
};

const renderCardBrandLogo = (lastFour: string) => {
  const num = parseInt(lastFour) || 0;
  if (num % 3 === 0) {
    return <span className="text-sm font-black italic text-white/90 font-sans tracking-tighter">VISA</span>;
  } else if (num % 3 === 1) {
    return (
      <div className="flex items-center">
        <div className="w-4 h-4 rounded-full bg-[#FF5F00] z-10 shrink-0" />
        <div className="w-4 h-4 rounded-full bg-[#F79E1B] -ml-2.5 shrink-0" />
      </div>
    );
  } else {
    return <span className="text-xs font-bold text-white/80 bg-white/10 px-1.5 py-0.5 rounded font-mono">ELO</span>;
  }
};

const getCardPhysicalStyle = (name: string) => {
  const n = name.toLowerCase();
  
  if (n.includes("nubank") || n.includes("nu ")) {
    return {
      bg: "from-[#8A05BE] via-[#73059E] to-[#4C0677]",
      accent: "border-[#A12BDE]/30 shadow-[0_0_20px_rgba(138,5,190,0.15)]",
      pattern: (
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <svg width="100%" height="100%">
            <pattern id="nu-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#nu-pattern)" />
          </svg>
        </div>
      )
    };
  }
  if (n.includes("itau") || n.includes("itaú")) {
    if (n.includes("personnalite") || n.includes("personnalité") || n.includes("black")) {
      return {
        bg: "from-[#141414] via-[#2A2A2A] to-[#0C0C0C]",
        accent: "border-amber-500/30 shadow-[0_0_20px_rgba(212,175,55,0.15)]",
        pattern: (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-full border-l border-amber-500/10 rotate-12 transform origin-top-right" />
            <div className="absolute bottom-4 left-6 text-[8px] font-serif text-amber-400/50 uppercase tracking-widest">PERSONNALITÉ</div>
          </div>
        )
      };
    }
    return {
      bg: "from-[#002d72] via-[#004bb3] to-[#E65100]",
      accent: "border-orange-500/30 shadow-[0_0_20px_rgba(230,81,0,0.2)]",
      pattern: (
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
      )
    };
  }
  if (n.includes("bradesco")) {
    return {
      bg: "from-[#CC092F] via-[#A80826] to-[#6E0316]",
      accent: "border-red-500/30 shadow-[0_0_20px_rgba(204,9,47,0.2)]",
      pattern: (
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="absolute -bottom-10 -right-10 w-44 h-44 border border-white rounded-full" />
          <div className="absolute -bottom-16 -right-16 w-44 h-44 border border-white rounded-full" />
        </div>
      )
    };
  }
  if (n.includes("santander")) {
    return {
      bg: "from-[#EC0000] via-[#CC0000] to-[#8F0000]",
      accent: "border-red-600/30 shadow-[0_0_20px_rgba(236,0,0,0.2)]",
      pattern: (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/5 rounded-full" />
        </div>
      )
    };
  }
  if (n.includes("inter")) {
    return {
      bg: "from-[#FF7A00] via-[#E55E00] to-[#B34200]",
      accent: "border-orange-400/30 shadow-[0_0_20px_rgba(255,122,0,0.2)]",
      pattern: (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-r border-t border-white/5 w-1/2 h-1/2" />
        </div>
      )
    };
  }
  if (n.includes("c6")) {
    return {
      bg: "from-[#111111] via-[#242424] to-[#0A0A0A]",
      accent: "border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]",
      pattern: (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-4 bottom-4 text-[10px] text-white/5 font-bold tracking-widest font-mono">CARBON</div>
        </div>
      )
    };
  }
  if (n.includes("caixa")) {
    return {
      bg: "from-[#1060AA] via-[#0D4E8B] to-[#072F58]",
      accent: "border-blue-400/30 shadow-[0_0_20px_rgba(16,96,170,0.2)]",
      pattern: (
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[#f47920]/10 pointer-events-none border-t border-[#f47920]/10" />
      )
    };
  }
  if (n.includes("brasil") || n.includes("bb") || n.includes("banco do brasil")) {
    return {
      bg: "from-[#00529C] via-[#00427D] to-[#2563EB]",
      accent: "border-yellow-400/30 shadow-[0_0_20px_rgba(0,82,156,0.2)]",
      pattern: (
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-1 bg-[#FFE600]/40" />
          <div className="absolute top-0 right-0 w-1 h-32 bg-[#FFE600]/40" />
        </div>
      )
    };
  }
  
  // Generic card fallback
  return {
    bg: "from-[#1F2937] via-[#111827] to-[#030712]",
    accent: "border-white/5 shadow-[0_0_20px_rgba(255,255,255,0.02)]",
    pattern: null
  };
};

export default function HomeDashboard() {
  // Authentication & Session
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Financial States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [score, setScore] = useState<FinancialScore | null>(null);
  const [aiHistory, setAiHistory] = useState<AIHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"geral" | "fluxo" | "calendario" | "cartoes" | "boletos" | "metas" | "relatorios" | "ia" | "perfil">("geral");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const TAB_NAMES: Record<string, string> = {
    geral: "Painel Geral",
    fluxo: "Fluxo de Caixa",
    calendario: "Calendário Financeiro",
    cartoes: "Cartões & Faturas",
    boletos: "Boletos & Contas",
    metas: "Metas Financeiras",
    relatorios: "Relatórios Executivos",
    ia: "Inteligência Artificial",
    perfil: "Perfil & Ajustes",
  };

  // Global search & header indicators
  const [searchQuery, setSearchQuery] = useState("");
  const [realtimeSynced, setRealtimeSynced] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Advanced AI panels states
  const [radarAlerts, setRadarAlerts] = useState<SmartAlert[]>([]);
  const [radarLoading, setRadarLoading] = useState(false);
  const [lossAnalysis, setLossAnalysis] = useState<LossAnalysisData>({
    scoreImpact: 0,
    wastes: [],
    redundantSubscriptions: [],
    possibleSavingsTotal: 0,
    tips: [
      "Cadastre suas despesas, assinaturas e investimentos para que a IA analise vazamentos patrimoniais."
    ]
  });
  const [lossLoading, setLossLoading] = useState(false);

  // Floating menu / Forms state
  const [activeFormType, setActiveFormType] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<any | null>(null);
  const [activeBoleto, setActiveBoleto] = useState<any | null>(null);
  const [activeReport, setActiveReport] = useState<any | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  // Calendar specific state
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  // Report filters
  const [reportPeriod, setReportPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [generatedReports, setGeneratedReports] = useState<FinancialReport[]>([]);
  const [customDeposits, setCustomDeposits] = useState<Record<string, string>>({});

  // Sync / Refresh helper
  const refreshAllData = (userId: string) => {
    setTransactions(NexFinDatabase.getTransactions(userId));
    setGoals(NexFinDatabase.getGoals(userId));
    setBudgets(NexFinDatabase.getBudgets(userId));
    setInvestments(NexFinDatabase.getInvestments(userId));
    setCards(NexFinDatabase.getCards(userId));
    setInstallments(NexFinDatabase.getInstallments(userId));
    setNotifications(NexFinDatabase.getNotifications(userId));
    setCalendarEvents(NexFinDatabase.getCalendarEvents(userId));
    setScore(NexFinDatabase.getScore(userId));
    setAiHistory(NexFinDatabase.getAiHistory(userId));
    setGeneratedReports(NexFinDatabase.getReports(userId));

    // Initialize Default Radar Alerts including pending monthly reminders!
    const currentAlerts = NexFinDatabase.getNotifications(userId).filter(n => n.type === "warning" || n.type === "danger");
    const calendarReminders = NexFinDatabase.getCalendarEvents(userId).filter(e => e.status === "pending");

    const activeRadarAlerts: SmartAlert[] = [];

    // Add pending monthly reminders as high priority alerts!
    calendarReminders.forEach((reminder) => {
      activeRadarAlerts.push({
        id: `ra-ce-${reminder.id}`,
        type: reminder.type === "expense" ? "warning" : "info",
        title: `Lembrete Pendente: ${reminder.title}`,
        description: `Pendente para dia ${new Date(reminder.date + "T00:00:00").toLocaleDateString("pt-BR")}. Valor: R$ ${reminder.amount.toFixed(2)}.`,
        category: "Lembrete do Mês",
      });
    });

    if (currentAlerts.length > 0) {
      currentAlerts.forEach(n => {
        activeRadarAlerts.push({
          id: n.id,
          type: n.type as any,
          title: n.title,
          description: n.message,
          category: "Alerta Radar",
          potentialSavings: n.type === "warning" ? "120,00" : undefined
        });
      });
    }

    if (activeRadarAlerts.length > 0) {
      setRadarAlerts(activeRadarAlerts);
    } else {
      setRadarAlerts([
        { id: "ra-empty", type: "info", title: "Nenhum Alerta Ativo", description: "Nenhum alerta pendente no radar. Adicione transações para receber análises inteligentes.", category: "Radar" }
      ]);
    }
  };

  // Recover session on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nexfin_active_user");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.id) {
            setTimeout(() => {
              setCurrentUser(parsed);
            }, 10);
          }
        } catch (e) {
          console.error("Failed to restore session on mount:", e);
        }
      }
    }
  }, []);

  // Initialize and load user data
  useEffect(() => {
    if (!currentUser) return;

    // Load / Seed database
    const userProfile = NexFinDatabase.getProfile(currentUser.id);
    
    // Defer state updates to prevent cascading render cycles
    setTimeout(() => {
      setProfile(userProfile);
      
      // Check if onboarding needs to be shown
      const hasSeenTutorial = localStorage.getItem(`nexfin_tutorial_${currentUser.id}`);
      if (!hasSeenTutorial) {
        setShowOnboarding(true);
      }

      refreshAllData(currentUser.id);
    }, 10);

    // Initialize simulated Realtime channel listener (e.g., synchronizes across tabs!)
    NexFinDatabase.initializeChannel((key, value) => {
      setRealtimeSynced(true);
      setTimeout(() => setRealtimeSynced(false), 2000);
      
      // Update respective hooks
      if (currentUser) {
        refreshAllData(currentUser.id);
      }
    });

  }, [currentUser]);

  // Periodic automatic cloud pull synchronization (Supabase) for cross-device updates (PC/Mobile)
  useEffect(() => {
    if (!currentUser) return;

    // Pull immediately on load
    const initialPull = async () => {
      try {
        const res = await NexFinDatabase.pullSync(currentUser.id);
        if (res.success && res.synchronized) {
          refreshAllData(currentUser.id);
          setRealtimeSynced(true);
          setTimeout(() => setRealtimeSynced(false), 2000);
        }
      } catch (err) {
        console.error("Initial sync pull error:", err);
      }
    };
    initialPull();

    // Set up periodic cloud pull every 3 seconds for near real-time cross-device sync
    const intervalId = setInterval(async () => {
      try {
        const res = await NexFinDatabase.pullSync(currentUser.id);
        if (res.success && res.synchronized) {
          refreshAllData(currentUser.id);
          setRealtimeSynced(true);
          setTimeout(() => setRealtimeSynced(false), 2000);
        }
      } catch (err) {
        console.error("Interval sync pull error:", err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [currentUser]);

  // Profile Photo Upload Ref and handler
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("A imagem é muito grande. Escolha uma imagem de até 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      if (base64String) {
        const updated = NexFinDatabase.updateProfile(currentUser.id, { avatar: base64String });
        setProfile(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  // Auth screen trigger
  const handleAuthSuccess = (userId: string, email: string, name: string) => {
    setCurrentUser({ id: userId, email, name });
  };

  const handleLogout = () => {
    localStorage.removeItem("nexfin_active_user");
    setCurrentUser(null);
  };

  const handleCloseOnboarding = () => {
    if (currentUser) {
      localStorage.setItem(`nexfin_tutorial_${currentUser.id}`, "true");
    }
    setShowOnboarding(false);
  };

  // Reset entire state
  const handleResetDashboard = () => {
    if (!currentUser) return;
    NexFinDatabase.clearAll(currentUser.id);
    setLossAnalysis({
      scoreImpact: 0,
      wastes: [],
      redundantSubscriptions: [],
      possibleSavingsTotal: 0,
      tips: [
        "Cadastre suas despesas, assinaturas e investimentos para que a IA analise vazamentos patrimoniais."
      ]
    });
    refreshAllData(currentUser.id);
    setShowResetConfirm(false);
    
    // Pulse Realtime notifier
    setRealtimeSynced(true);
    setTimeout(() => setRealtimeSynced(false), 2000);
  };

  // Exporter simulations
  const handleExportData = (format: "csv" | "excel" | "pdf") => {
    if (transactions.length === 0) return;
    
    // Build report visual item
    const reportTitle = `Relatório Financeiro ${reportPeriod === "monthly" ? "Mensal" : reportPeriod === "quarterly" ? "Trimestral" : "Anual"} - ${new Date().toLocaleDateString("pt-BR")}`;
    if (currentUser) {
      NexFinDatabase.addReport(currentUser.id, {
        type: reportPeriod,
        title: reportTitle,
        fileUrl: "#",
        generatedAt: new Date().toISOString()
      });
      refreshAllData(currentUser.id);
    }

    // CSV / Excel Trigger
    if (format === "csv" || format === "excel") {
      let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
      csvContent += "ID;Data;Categoria;Descrição;Valor;Tipo;Status\n";
      transactions.forEach((t) => {
        csvContent += `${t.id};${new Date(t.date).toLocaleDateString("pt-BR")};${t.category};${t.description};${t.amount};${t.type === "income" ? "Entrada" : "Saída"};${t.status}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `NexFin_Relatorio_${reportPeriod}.${format === "excel" ? "xls" : "csv"}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "pdf") {
      const totalIncome = transactions.filter(t => t.type === "income").reduce((acc, curr) => acc + curr.amount, 0);
      const totalExpense = transactions.filter(t => t.type === "expense").reduce((acc, curr) => acc + curr.amount, 0);
      const netBalance = totalIncome - totalExpense;

      setActiveReport({
        title: reportTitle,
        period: reportPeriod === "monthly" ? "Mensal" : reportPeriod === "quarterly" ? "Trimestral" : "Anual",
        generatedAt: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR"),
        totalIncome,
        totalExpense,
        netBalance,
        transactions: [...transactions],
        investments: [...investments],
        goals: [...goals],
      });
    }
  };

  // Central save handler for FloatingMenu forms
  const handleSaveFormData = (dataType: string, data: any) => {
    if (!currentUser) return;

    if (dataType === "transaction") {
      NexFinDatabase.addTransaction(currentUser.id, data);
      NexFinDatabase.addNotification(
        currentUser.id,
        data.type === "income" ? "success" : "info",
        data.type === "income" ? "Receita Registrada" : "Despesa Registrada",
        `R$ ${data.amount.toFixed(2)} registrado sob categoria ${data.category}`
      );
      // Synchronize transaction with calendar
      NexFinDatabase.addCalendarEvent(currentUser.id, {
        title: data.description,
        amount: data.amount,
        type: data.type,
        date: data.date,
        status: data.status || "paid",
        isRecurring: false,
      });
    } else if (dataType === "goal") {
      NexFinDatabase.addGoal(currentUser.id, data);
      NexFinDatabase.addNotification(currentUser.id, "success", "Nova Meta Criada", `Objetivo ${data.name} registrado.`);
    } else if (dataType === "investment") {
      NexFinDatabase.addInvestment(currentUser.id, data);
      NexFinDatabase.addNotification(currentUser.id, "success", "Investimento Registrado", `Ativo ${data.name} adicionado ao portfólio.`);
    } else if (dataType === "installment") {
      NexFinDatabase.addInstallment(currentUser.id, data);
      NexFinDatabase.addNotification(currentUser.id, "info", "Parcelamento Cadastrado", `${data.description} parcelado em ${data.installmentsCount}x.`);
      
      // For each installment, create a calendar event in successive months
      const firstDate = new Date(data.firstDueDate || new Date());
      for (let i = 0; i < data.installmentsCount; i++) {
        const nextMonthDate = new Date(firstDate.getTime());
        nextMonthDate.setMonth(firstDate.getMonth() + i);
        const formattedDate = nextMonthDate.toISOString().split("T")[0];
        
        NexFinDatabase.addCalendarEvent(currentUser.id, {
          title: `${data.description} (${i + 1}/${data.installmentsCount})`,
          amount: data.installmentAmount,
          type: "expense",
          date: formattedDate,
          status: i === 0 ? "paid" : "pending",
          isRecurring: false,
        });
      }
    } else if (dataType === "calendar_event") {
      NexFinDatabase.addCalendarEvent(currentUser.id, data);
      NexFinDatabase.addNotification(currentUser.id, "info", "Agendamento Efetuado", `${data.title} agendado para ${data.date}.`);
    } else if (dataType === "card") {
      if (data.id) {
        NexFinDatabase.updateCard(currentUser.id, data.id, data);
        NexFinDatabase.addNotification(currentUser.id, "success", "Cartão Atualizado", `Cartão ${data.name} atualizado com sucesso.`);
      } else {
        NexFinDatabase.addCard(currentUser.id, data);
        NexFinDatabase.addNotification(currentUser.id, "success", "Cartão Adicionado", `Cartão ${data.name} cadastrado com sucesso.`);
      }
    }

    // Trigger synced indicator
    setRealtimeSynced(true);
    setTimeout(() => setRealtimeSynced(false), 2000);

    // Refresh states
    refreshAllData(currentUser.id);
  };

  // AI-driven radar generator using server-side Gemini API
  const handleGenerateAiRadar = async () => {
    if (!currentUser || radarLoading) return;
    setRadarLoading(true);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "radar",
          dataContext: {
            transactions,
            goals,
            budgets,
            investments,
            installments,
            calendarEvents
          }
        })
      });
      const res = await response.json();
      if (res.data && Array.isArray(res.data)) {
        setRadarAlerts(res.data);
        NexFinDatabase.addNotification(currentUser.id, "success", "Radar Atualizado", "A inteligência artificial recalculou novos alertas do radar.");
      }
    } catch (err) {
      console.error("Radar AI error:", err);
      alert("Houve um erro técnico. Usando dados estáticos do radar.");
    } finally {
      setRadarLoading(false);
    }
  };

  // AI-driven Leak analyzer using server-side Gemini API
  const handleGenerateAiLoss = async () => {
    if (!currentUser || lossLoading) return;
    setLossLoading(true);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "loss",
          dataContext: {
            transactions,
            goals,
            budgets,
            investments,
            installments,
            calendarEvents
          }
        })
      });
      const res = await response.json();
      if (res.data) {
        setLossAnalysis(res.data);
        NexFinDatabase.addNotification(currentUser.id, "success", "Análise de Fugas Atualizada", "O consultor de vazamentos gerou novas recomendações.");
      }
    } catch (err) {
      console.error("Loss AI error:", err);
      alert("Erro ao conectar ao Gemini para análise de fuga. Verifique seus segredos.");
    } finally {
      setLossLoading(false);
    }
  };

  // Quick action interactions
  const handleToggleEventStatus = (eventId: string) => {
    if (!currentUser) return;
    const updated = NexFinDatabase.toggleCalendarEventStatus(currentUser.id, eventId);
    if (updated) {
      refreshAllData(currentUser.id);
      setRealtimeSynced(true);
      setTimeout(() => setRealtimeSynced(false), 2000);
    }
  };

  const handleDeleteCalendarEvent = (eventId: string) => {
    if (!currentUser) return;
    if (confirm("Deseja realmente excluir este lembrete/agendamento?")) {
      NexFinDatabase.deleteCalendarEvent(currentUser.id, eventId);
      refreshAllData(currentUser.id);
      NexFinDatabase.addNotification(currentUser.id, "info", "Lembrete Excluído", "O lembrete foi removido com sucesso.");
      setRealtimeSynced(true);
      setTimeout(() => setRealtimeSynced(false), 2000);
    }
  };

  const handleDownloadBoleto = (bill: any) => {
    if (!currentUser) return;
    setActiveBoleto(bill);
    setCopiedPix(false);
  };

  const handleAddGoalDeposit = (goalId: string, value: number) => {
    if (!currentUser) return;
    NexFinDatabase.updateGoalProgress(currentUser.id, goalId, value);
    refreshAllData(currentUser.id);
    setRealtimeSynced(true);
    setTimeout(() => setRealtimeSynced(false), 2000);
  };

  // Calculations for dashboard
  const incomeTotal = transactions.filter(t => t.userId === currentUser?.id && t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expenseTotal = transactions.filter(t => t.userId === currentUser?.id && t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const balanceTotal = incomeTotal - expenseTotal;
  const savingsTotal = investments.reduce((sum, i) => sum + i.amount, 0);

  // Filter transactions globally
  const filteredTransactions = transactions.filter((t) => {
    if (!searchQuery) return true;
    return (
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.amount.toString().includes(searchQuery)
    );
  });

  // Calendar calculations
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Padding for days of previous month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1));
  };

  const handlePrevMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1));
  };

  if (!currentUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen pb-24 relative selection:bg-[#00C8FF]/30">
      
      {/* Realtime Synced Feedback Badge */}
      <AnimatePresence>
        {realtimeSynced && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 16, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[120] px-4 py-2 bg-gradient-to-r from-[#00C8FF] to-[#00BFFF] text-black font-extrabold text-xs rounded-full shadow-[0_0_20px_rgba(0,200,255,0.4)] flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>✓ Alterações sincronizadas com sucesso.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER */}
      <header id="nexfin-top-header" className="h-16 flex items-center justify-between px-4 sm:px-6 bg-[#070b14]/80 border-b border-white/5 backdrop-blur-md sticky top-0 z-40">
        
        {/* Left: Menu toggle (3 bars) & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            id="menu-toggle-btn"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 sm:px-3 sm:py-2 text-gray-300 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#00C8FF]/40 transition-all flex items-center gap-2 cursor-pointer shadow-sm group"
            aria-label="Abrir menu de navegação (3 barras)"
            title="Abrir menu (3 barras)"
          >
            <Menu className="w-5 h-5 text-[#00C8FF] group-hover:scale-110 transition-transform stroke-[2.5]" />
            <span className="hidden sm:inline text-xs font-semibold tracking-wide text-gray-200">Menu</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-[#00C8FF] tracking-wider hidden sm:inline">NexFin</span>
              <span className="text-xs text-gray-600 hidden sm:inline">/</span>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {TAB_NAMES[activeTab] || activeTab}
              </h1>
            </div>
          </div>
        </div>

        {/* Global Search Bar (hidden on small screens) */}
        <div className="relative w-80 hidden lg:block mx-4">
          <Search className="w-4 h-4 absolute left-4 top-2.5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisa Global (Receitas, Metas, Calendário...)"
            className="w-full bg-[#111827] border border-white/10 rounded-full px-10 py-2 text-xs focus:border-[#00C8FF] outline-none transition-all text-white placeholder-gray-500"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-2 text-gray-400 hover:text-white text-xs font-semibold"
            >
              ×
            </button>
          )}
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Voice Launch Button */}
          <button
            id="header-voice-quick-btn"
            onClick={() => setShowVoiceModal(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-[#00C8FF]/15 to-[#00BFFF]/15 hover:from-[#00C8FF]/25 hover:to-[#00BFFF]/25 border border-[#00C8FF]/40 rounded-xl text-xs font-mono font-bold text-[#00C8FF] flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(0,200,255,0.15)] group"
            title="Lançamento Rápido por Voz ou Texto"
          >
            <Mic className="w-4 h-4 text-[#00C8FF] group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline">Lançar por Voz</span>
          </button>

          {/* Interactive Guide button */}
          <button
            onClick={() => setShowOnboarding(true)}
            className="p-2 text-gray-400 hover:text-[#00C8FF] rounded-xl hover:bg-white/5 transition cursor-pointer"
            title="Guia Interativo"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* AI Advisor Button */}
          <button
            onClick={() => setShowAiModal(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-[#00C8FF]/15 to-[#00BFFF]/15 hover:from-[#00C8FF]/25 hover:to-[#00BFFF]/25 border border-[#00C8FF]/40 rounded-xl text-xs font-mono font-bold text-[#00C8FF] flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(0,200,255,0.15)]"
          >
            <Sparkles className="w-4 h-4 animate-pulse text-[#00C8FF]" />
            <span className="hidden sm:inline">NexFin AI</span>
          </button>

          {/* Notifications button */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-[#FF0F7B] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-[0_0_8px_#FF0F7B]">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown menu */}
            <AnimatePresence>
              {showNotificationsDropdown && (
                <motion.div 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  className="absolute right-0 mt-2 w-80 bg-[#111827] border border-white/10 rounded-2xl p-4 shadow-2xl z-50 space-y-3"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <h4 className="text-xs font-mono font-bold uppercase text-[#00C8FF]">Notificações</h4>
                    <button 
                      onClick={() => {
                        if (currentUser) {
                          NexFinDatabase.markNotificationsAsRead(currentUser.id);
                          setNotifications(prev => prev.map(n => ({...n, read: true})));
                        }
                      }}
                      className="text-[10px] text-gray-400 hover:text-white hover:underline"
                    >
                      Marcar lidas
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 no-scrollbar">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-4">Nenhuma notificação recente.</p>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div key={n.id} className={`p-2.5 rounded-xl text-left ${n.read ? 'bg-white/[0.02]' : 'bg-[#00C8FF]/5 border border-[#00C8FF]/20'}`}>
                          <h5 className="text-xs font-bold text-white truncate">{n.title}</h5>
                          <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{n.message}</p>
                          <span className="text-[9px] text-gray-500 font-mono mt-1 block">
                            {new Date(n.date).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reset button matching mockup color and text */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-red-400 text-[10px] font-mono font-bold border border-red-500/20 uppercase transition cursor-pointer hidden sm:block"
            title="Redefinir dados"
          >
            ZERAR
          </button>

          {/* User profile avatar button */}
          <button
            id="header-profile-btn"
            onClick={() => setActiveTab("perfil")}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition border border-white/5 cursor-pointer"
            title="Meu Perfil"
          >
            <img 
              src={profile?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
              alt={profile?.name || "Usuário"} 
              className="w-7 h-7 rounded-lg object-cover border border-[#00C8FF]/40"
              onError={(e: any) => {
                e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
              }}
            />
            <span className="hidden md:inline text-xs font-medium text-gray-200">
              {profile?.name ? profile.name.split(" ")[0] : "Perfil"}
            </span>
          </button>

          {/* Logout button */}
          <button
            id="header-logout-btn"
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer border border-white/5"
            title="Sair da Conta (Logout)"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>

      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Global Search Filtering Alert overlay */}
        {searchQuery && (
          <div className="mb-6 p-3 bg-cyan-950/40 border border-[#00C8FF]/20 rounded-xl text-xs text-gray-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00C8FF] animate-ping" />
              <span>Filtrando painel por: <b className="text-white">&quot;{searchQuery}&quot;</b>. Encontramos {filteredTransactions.length} correspondências.</span>
            </div>
            <button onClick={() => setSearchQuery("")} className="text-xs text-[#00C8FF] hover:underline font-semibold">Exibir Todos</button>
          </div>
        )}

        {/* TABS VIEW CONTROLLERS */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: GERAL (DASHBOARD PRINCIPAL) */}
          {activeTab === "geral" && (
            <motion.div
              key="geral"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* RADAR DE ALERTAS INTELIGENTES */}
              <RadarAlerts 
                alerts={radarAlerts}
                onAddAlert={(a) => {
                  const newAlert: SmartAlert = { id: "ra-" + Date.now(), ...a };
                  setRadarAlerts(prev => [newAlert, ...prev]);
                }}
                onRemoveAlert={(id) => setRadarAlerts(prev => prev.filter(a => a.id !== id))}
                onGenerateAiAlerts={handleGenerateAiRadar}
                aiLoading={radarLoading}
              />

              {/* CORE METRICS GRID */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Saldo Total */}
                <div className="bg-[#111827] p-5 rounded-2xl border border-white/5 shadow-lg hover:border-[#00C8FF]/20 transition duration-300">
                  <div className="flex justify-between items-center text-gray-400 text-[10px] font-mono uppercase font-bold">
                    <span>Saldo Total</span>
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                      <TrendingUp className="w-4 h-4 text-[#00C8FF]" />
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-mono font-black mt-2 text-[#00C8FF]">
                    R$ {balanceTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[10px] text-green-400 mt-1.5 font-sans font-semibold">
                    ▲ +5.2% este mês
                  </p>
                </div>

                {/* Card 2: Receitas */}
                <div className="bg-[#111827] p-5 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition duration-300">
                  <div className="flex justify-between items-center text-gray-400 text-[10px] font-mono uppercase font-bold">
                    <span>Receitas</span>
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                      <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-mono font-black mt-2 text-white">
                    R$ {incomeTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </h3>
                  <div className="w-full bg-white/5 h-1 rounded-full mt-3">
                    <div className="bg-emerald-400 h-full w-[80%] rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                  </div>
                </div>

                {/* Card 3: Despesas */}
                <div className="bg-[#111827] p-5 rounded-2xl border border-white/5 hover:border-[#FF0F7B]/20 transition duration-300">
                  <div className="flex justify-between items-center text-gray-400 text-[10px] font-mono uppercase font-bold">
                    <span>Despesas</span>
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                      <ArrowDownRight className="w-4 h-4 text-[#FF0F7B]" />
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-mono font-black mt-2 text-white">
                    R$ {expenseTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </h3>
                  <div className="w-full bg-white/5 h-1 rounded-full mt-3">
                    <div className="bg-[#FF0F7B] h-full w-[45%] rounded-full shadow-[0_0_8px_rgba(255,15,123,0.5)]" />
                  </div>
                </div>

                {/* Card 4: Economia */}
                <div className="bg-[#111827] p-5 rounded-2xl border border-white/5 hover:border-[#00BFFF]/20 transition duration-300">
                  <div className="flex justify-between items-center text-gray-400 text-[10px] font-mono uppercase font-bold">
                    <span>Economia</span>
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                      <Target className="w-4 h-4 text-[#00BFFF]" />
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-mono font-black mt-2 text-white">
                    R$ {savingsTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </h3>
                  <div className="flex gap-1 mt-3">
                    <div className="h-1 flex-1 bg-[#00C8FF] rounded" />
                    <div className="h-1 flex-1 bg-[#00C8FF]/50 rounded" />
                    <div className="h-1 flex-1 bg-[#00C8FF]/20 rounded" />
                  </div>
                </div>
              </div>

              {/* FINANCES GRAPH CHART + SCORE */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Score health dial widget */}
                <div className="lg:col-span-1">
                  {score && <ScoreCard scoreData={score} hasData={transactions.length > 0} />}
                </div>

                {/* Simulated Custom Premium Line Chart (Income vs Expense progressions) */}
                <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] text-[#00C8FF] font-mono tracking-widest uppercase font-semibold">Tendências</span>
                      <h4 className="text-sm font-display font-extrabold text-white mt-0.5">Fluxo de Caixa Patrimonial</h4>
                    </div>
                    <div className="flex gap-2 text-[10px] font-mono text-gray-400">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Entradas</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#FF0F7B]"></span> Saídas</span>
                    </div>
                  </div>

                  {/* SVG glowing graph */}
                  <div className="w-full h-44 relative">
                    {transactions.length === 0 ? (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#070B13]/60 backdrop-blur-[2px] rounded-xl p-4 text-center">
                        <TrendingUp className="w-8 h-8 text-[#00C8FF] mb-2 animate-bounce" />
                        <p className="text-xs font-bold text-white">Nenhum fluxo de caixa registrado</p>
                        <p className="text-[10px] text-gray-400 mt-1 max-w-xs leading-relaxed">
                          Adicione sua primeira receita ou despesa clicando no botão flutuante <span className="text-[#00C8FF] font-bold font-mono">&quot;+&quot;</span> abaixo para gerar o gráfico em tempo real.
                        </p>
                      </div>
                    ) : null}

                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Gradients */}
                      <defs>
                        <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00C8FF" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#00C8FF" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="magentaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF0F7B" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#FF0F7B" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                      <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                      <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

                      {/* Income Path */}
                      {transactions.length > 0 && (
                        <>
                          <path d="M 0 80 Q 25 30 50 40 T 100 20 L 100 100 L 0 100 Z" fill="url(#cyanGrad)" />
                          <path d="M 0 80 Q 25 30 50 40 T 100 20" fill="none" stroke="#00C8FF" strokeWidth="2" strokeLinecap="round" />
                        </>
                      )}

                      {/* Expense Path */}
                      {transactions.length > 0 && (
                        <>
                          <path d="M 0 90 Q 25 60 50 50 T 100 45 L 100 100 L 0 100 Z" fill="url(#magentaGrad)" />
                          <path d="M 0 90 Q 25 60 50 50 T 100 45" fill="none" stroke="#FF0F7B" strokeWidth="2" strokeLinecap="round" />
                        </>
                      )}
                    </svg>

                    <div className="absolute top-2 left-2 text-[10px] font-mono text-gray-500">{transactions.length > 0 ? "R$ 15.000" : "R$ 0"}</div>
                    <div className="absolute bottom-2 left-2 text-[10px] font-mono text-gray-500">R$ 0</div>
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-gray-500 mt-2">
                    <span>Jan</span>
                    <span>Mar</span>
                    <span>Mai</span>
                    <span>Jul</span>
                    <span>Set</span>
                    <span>Dez</span>
                  </div>
                </div>

              </div>

              {/* SECONDARY ROW GRID: LATESTS EVENTS + EXCLUSIVE LOSS PANELS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* "Onde estou perdendo dinheiro" analysis */}
                <LossPanel 
                  analysis={lossAnalysis} 
                  onRefresh={handleGenerateAiLoss}
                  loading={lossLoading}
                />

                {/* Upcoming/Recent transactions calendar view list */}
                <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start pb-4 border-b border-white/5 mb-4">
                      <div>
                        <span className="text-[10px] text-[#00C8FF] font-mono tracking-widest uppercase font-semibold">Calendário</span>
                        <h4 className="text-sm font-display font-extrabold text-white mt-0.5">Próximos Vencimentos</h4>
                      </div>
                      <button 
                        onClick={() => setActiveTab("calendario")}
                        className="text-xs text-[#00C8FF] hover:underline"
                      >
                        Ver calendário completo
                      </button>
                    </div>

                    <div className="space-y-3">
                      {calendarEvents.slice(0, 4).map((ce) => (
                        <div key={ce.id} className="bg-white/[0.01] border border-white/5 rounded-xl p-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${ce.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                              {ce.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-xs text-white font-bold">{ce.title}</p>
                              <span className="text-[10px] text-gray-500 font-mono">Vencimento: {new Date(ce.date).toLocaleDateString("pt-BR")}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-black text-white">R$ {ce.amount.toFixed(2)}</span>
                            <button
                              onClick={() => handleToggleEventStatus(ce.id)}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition ${ce.status === "paid" ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-gray-400 border border-white/10'}`}
                            >
                              {ce.status === "paid" ? "Pago ✓" : "Pagar"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-[#0d121f] rounded-lg text-[10px] text-gray-400 flex items-center justify-between">
                    <span>Você tem <b>{calendarEvents.filter(e => e.status === "pending").length}</b> agendamentos pendentes.</span>
                    <button onClick={() => setActiveTab("calendario")} className="text-[#00C8FF] font-bold uppercase tracking-wider text-[9px] hover:underline">Acessar</button>
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 2: FLUXO (TRANSACTIONS DETAILS) */}
          {activeTab === "fluxo" && (
            <motion.div
              key="fluxo"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-[#00C8FF] font-mono tracking-widest uppercase font-semibold">Transações</span>
                  <h3 className="text-lg font-display font-black text-white mt-0.5">FLUXO DE CAIXA E EXTRATO</h3>
                </div>
                <button
                  onClick={() => setActiveFormType("income")}
                  className="px-4 py-2 bg-[#00C8FF] hover:bg-[#00BFFF] text-black font-extrabold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3px]" />
                  <span>Nova Lançamento</span>
                </button>
              </div>

              {/* Extrato listings */}
              <div className="glass-card rounded-2xl p-6 border border-white/5">
                <div className="space-y-4">
                  {filteredTransactions.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 text-xs">
                      Nenhum registro encontrado. Cadastre novas transações utilizando o botão flutuante &quot;+&quot;.
                    </div>
                  ) : (
                    filteredTransactions.map((t) => (
                      <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#0d121f]/50 border border-white/5 rounded-xl hover:border-[#00C8FF]/10 transition duration-300">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${t.type === "income" ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                            {t.type === "income" ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white leading-tight">{t.description}</h4>
                            <div className="flex gap-2 text-[10px] text-gray-500 font-mono mt-0.5">
                              <span>{t.category}</span>
                              <span>•</span>
                              <span>{new Date(t.date).toLocaleDateString("pt-BR")}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <span className={`text-sm font-mono font-black ${t.type === "income" ? "text-emerald-400" : "text-white"}`}>
                            {t.type === "income" ? "+" : "-"} R$ {t.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                          <button
                            onClick={() => {
                              if (currentUser) {
                                NexFinDatabase.deleteTransaction(currentUser.id, t.id);
                                refreshAllData(currentUser.id);
                              }
                            }}
                            className="p-1.5 rounded bg-white/5 hover:bg-[#FF4D4F]/10 text-gray-500 hover:text-[#FF4D4F] transition cursor-pointer"
                            title="Remover transação"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: CALENDÁRIO */}
          {activeTab === "calendario" && (
            <motion.div
              key="calendario"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-[#00C8FF] font-mono tracking-widest uppercase font-semibold">Agendamento</span>
                  <h3 className="text-lg font-display font-black text-white mt-0.5">CALENDÁRIO FINANCEIRO INTEGRA</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 bg-[#111827] border border-white/5 rounded-lg text-gray-400 hover:text-white transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 bg-[#111827] text-xs font-bold text-white rounded-lg border border-white/5 select-none font-mono flex items-center justify-center">
                    {currentCalendarDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).toUpperCase()}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 bg-[#111827] border border-white/5 rounded-lg text-gray-400 hover:text-white transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Calendar View Grid */}
                <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/5">
                  <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono uppercase text-gray-500 font-bold mb-3">
                    <span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {getDaysInMonth(currentCalendarDate).map((day, idx) => {
                      if (!day) return <div key={idx} className="aspect-square bg-transparent rounded-lg"></div>;

                      // Check events on this day
                      const formattedDayStr = day.toISOString().split("T")[0];
                      const dayEvents = calendarEvents.filter(e => e.date === formattedDayStr);

                      return (
                        <div 
                          key={idx} 
                          onClick={() => alert(`Visualizando agendamentos para ${day.toLocaleDateString("pt-BR")}`)}
                          className="aspect-square bg-[#0d121f]/50 border border-white/5 hover:border-[#00C8FF]/30 rounded-lg p-1 text-left flex flex-col justify-between cursor-pointer transition"
                        >
                          <span className="text-xs font-mono font-bold text-gray-400">{day.getDate()}</span>
                          {dayEvents.length > 0 && (
                            <div className="flex gap-0.5 max-w-full overflow-hidden">
                              {dayEvents.map((e) => (
                                <span 
                                  key={e.id} 
                                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${e.type === 'income' ? 'bg-emerald-400' : 'bg-[#FF0F7B]'}`}
                                  title={e.title}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Calendar Side Event list for current month */}
                <div className="lg:col-span-1 glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xs font-display font-black text-gray-400 uppercase tracking-widest">Lembretes do Mês</h4>
                      <button
                        onClick={() => setActiveFormType("calendar_event")}
                        className="px-2 py-1 bg-[#00C8FF]/15 hover:bg-[#00C8FF]/25 text-[#00C8FF] text-[10px] font-black rounded transition flex items-center gap-1 cursor-pointer"
                        title="Adicionar Novo Lembrete"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Novo Lembrete</span>
                      </button>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto no-scrollbar">
                      {calendarEvents.map((ce) => (
                        <div key={ce.id} className="p-3 bg-[#0d121f]/60 rounded-xl border border-white/5 flex flex-col gap-2">
                          <div className="flex justify-between items-start gap-1">
                            <div>
                              <p className="text-xs font-bold text-white">{ce.title}</p>
                              <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">{new Date(ce.date + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                            </div>
                            <span className={`text-xs font-mono font-bold ${ce.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>R$ {ce.amount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[9px] text-gray-500 font-semibold">{ce.isRecurring ? "Recorrente Mensal" : "Boleto Único"}</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleToggleEventStatus(ce.id)}
                                className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition ${ce.status === "paid" ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-white/5 text-gray-400 border border-white/5'}`}
                              >
                                {ce.status === "paid" ? "Pago ✓" : "Pendente"}
                              </button>
                              <button
                                onClick={() => handleDeleteCalendarEvent(ce.id)}
                                className="p-1 bg-white/5 hover:bg-rose-500/10 rounded text-gray-400 hover:text-rose-400 transition cursor-pointer"
                                title="Excluir Lembrete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 4: CARTÕES */}
          {activeTab === "cartoes" && (
            <motion.div
              key="cartoes"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-[#00C8FF] font-mono tracking-widest uppercase font-semibold">Crédito</span>
                  <h3 className="text-lg font-display font-black text-white mt-0.5">MEUS CARTÕES</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCard(null);
                      setActiveFormType("card");
                    }}
                    className="px-4 py-2 bg-[#00C8FF]/10 hover:bg-[#00C8FF]/20 text-[#00C8FF] border border-[#00C8FF]/30 font-extrabold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3px]" />
                    <span>Adicionar Cartão</span>
                  </button>
                  <button
                    onClick={() => setActiveFormType("installment")}
                    className="px-4 py-2 bg-gradient-to-r from-[#00C8FF] to-[#00BFFF] hover:brightness-110 text-black font-extrabold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3px]" />
                    <span>Novo Parcelamento</span>
                  </button>
                </div>
              </div>

              {/* Cards row layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cards.map((c) => {
                  const cardStyle = getCardPhysicalStyle(c.name);
                  return (
                    <div key={c.id} className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
                      {/* Metal design physical look */}
                      <div className={`w-full h-44 rounded-xl bg-gradient-to-tr ${cardStyle.bg} p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden border ${cardStyle.accent}`}>
                        <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full blur-[40px] pointer-events-none" />
                        {cardStyle.pattern}
                        
                        <div className="flex justify-between items-start z-10">
                          {renderBankLogo(c.name)}
                          <span className="text-[9px] font-mono text-white/50 tracking-widest uppercase">NexFin Metal</span>
                        </div>

                        <div className="my-2 z-10">
                          <span className="text-lg font-mono text-white/95 font-bold tracking-wider">•••• •••• •••• {c.lastFour || '0000'}</span>
                        </div>

                        <div className="flex justify-between items-end z-10">
                          <div>
                            <p className="text-[8px] text-white/50 uppercase tracking-wider">Validade</p>
                            <span className="text-xs text-white/95 font-mono font-medium">{c.expiry || '12/32'}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {/* Metallic Golden chip with modern details */}
                            <div className="w-8 h-6 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 border border-amber-600/30 shadow-inner flex flex-col justify-between p-1">
                              <div className="flex justify-between">
                                <div className="w-2.5 h-1 border-r border-b border-black/10" />
                                <div className="w-2.5 h-1 border-l border-b border-black/10" />
                              </div>
                              <div className="h-0.5 bg-black/10 w-full" />
                              <div className="flex justify-between">
                                <div className="w-2.5 h-1 border-r border-t border-black/10" />
                                <div className="w-2.5 h-1 border-l border-t border-black/10" />
                              </div>
                            </div>
                            {renderCardBrandLogo(c.lastFour)}
                          </div>
                        </div>
                      </div>

                    <div className="mt-6 flex items-center justify-between gap-4">
                      {/* Limit tracker */}
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Fatura Atual</span>
                          <span className="font-mono text-white">R$ {c.currentSpent.toFixed(2)} / R$ {c.limit.toLocaleString("pt-BR")}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-[#00C8FF] rounded-full" style={{ width: `${Math.min(100, (c.currentSpent / c.limit) * 100)}%` }} />
                        </div>
                      </div>

                      {/* Edit/Delete actions */}
                      <div className="flex items-center gap-1 shrink-0 pt-3">
                        <button
                          onClick={() => {
                            setEditingCard(c);
                            setActiveFormType("card");
                          }}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-[#00C8FF] transition cursor-pointer"
                          title="Editar Cartão"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Deseja realmente excluir o cartão "${c.name}"?`)) {
                              if (currentUser) {
                                NexFinDatabase.deleteCard(currentUser.id, c.id);
                                refreshAllData(currentUser.id);
                              }
                            }
                          }}
                          className="p-2 bg-white/5 hover:bg-rose-500/10 rounded-lg text-gray-400 hover:text-rose-400 transition cursor-pointer"
                          title="Excluir Cartão"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </motion.div>
          )}

          {/* TAB 5: BOLETOS */}
          {activeTab === "boletos" && (
            <motion.div
              key="boletos"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-[#00C8FF] font-mono tracking-widest uppercase font-semibold">Boletos</span>
                  <h3 className="text-lg font-display font-black text-white mt-0.5">GERENCIAMENTO DE BOLETOS</h3>
                </div>
              </div>

              {/* Bills List with document upload simulation */}
              <div className="glass-card rounded-2xl p-6 border border-white/5">
                <div className="space-y-4">
                  {calendarEvents.filter(e => e.type === "expense").map((bill) => (
                    <div key={bill.id} className="p-4 bg-[#0d121f]/50 border border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-rose-500/15 border border-rose-500/20 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-rose-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{bill.title}</h4>
                          <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">Vencimento: {new Date(bill.date).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm font-mono font-black text-white">R$ {bill.amount.toFixed(2)}</span>
                        <button
                          onClick={() => handleToggleEventStatus(bill.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${bill.status === "paid" ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-white/5 text-gray-400 border border-white/5'}`}
                        >
                          {bill.status === "paid" ? "Quitado ✓" : "Pendente"}
                        </button>
                        <button
                          onClick={() => handleDownloadBoleto(bill)}
                          className="p-2 bg-[#111827] border border-white/5 rounded-lg text-gray-400 hover:text-[#00C8FF] hover:border-[#00C8FF]/30 transition cursor-pointer"
                          title="Baixar Boleto / PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => alert("Simulador de Anexo: Documento enviado e associado a esta despesa.")}
                          className="p-2 bg-[#111827] border border-white/5 rounded-lg text-gray-400 hover:text-white hover:border-white/10 transition cursor-pointer"
                          title="Fazer Upload de Comprovante"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 6: METAS */}
          {activeTab === "metas" && (
            <motion.div
              key="metas"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-[#00C8FF] font-mono tracking-widest uppercase font-semibold">Sonhos</span>
                  <h3 className="text-lg font-display font-black text-white mt-0.5">METAS E OBJETIVOS DE ECONOMIA</h3>
                </div>
                <button
                  onClick={() => setActiveFormType("goal")}
                  className="px-4 py-2 bg-[#00C8FF] hover:bg-[#00BFFF] text-black font-extrabold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3px]" />
                  <span>Nova Meta</span>
                </button>
              </div>

              {/* Goals view with target deposition simulator */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map((g) => {
                  const percentage = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                  return (
                    <div key={g.id} className="glass-card rounded-2xl p-6 border border-white/5 hover:border-cyan-500/20 transition duration-300 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start pb-2 border-b border-white/5 mb-3">
                          <div>
                            <span className="text-[10px] font-mono uppercase text-gray-500">{g.category}</span>
                            <h4 className="text-sm font-display font-extrabold text-white mt-0.5">{g.name}</h4>
                          </div>
                          <span className="text-xs font-mono font-black text-[#00C8FF]">{percentage}%</span>
                        </div>

                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                          <span>Progresso</span>
                          <span className="font-mono text-white">R$ {g.currentAmount.toLocaleString("pt-BR")} / R$ {g.targetAmount.toLocaleString("pt-BR")}</span>
                        </div>

                        {/* Visual progress bar */}
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                          <div className="h-full bg-gradient-to-r from-[#00C8FF] to-[#00BFFF] rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>

                      {/* Deposit Simulator button */}
                      <div className="flex flex-col sm:flex-row items-center gap-2 justify-end w-full mt-2">
                        <div className="relative flex-1 w-full sm:max-w-[150px]">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-bold font-mono">R$</span>
                          <input
                            type="number"
                            placeholder="Valor customizado"
                            value={customDeposits[g.id] || ""}
                            onChange={(e) => setCustomDeposits(prev => ({ ...prev, [g.id]: e.target.value }))}
                            className="w-full bg-[#111827] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00C8FF] font-mono transition"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const val = parseFloat(customDeposits[g.id] || "");
                            if (isNaN(val) || val <= 0) {
                              alert("Por favor, insira um valor válido para depositar.");
                              return;
                            }
                            handleAddGoalDeposit(g.id, val);
                            setCustomDeposits(prev => ({ ...prev, [g.id]: "" }));
                          }}
                          className="w-full sm:w-auto px-4 py-1.5 bg-[#00C8FF] hover:bg-[#00BFFF] text-black font-extrabold text-xs rounded-lg transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,200,255,0.2)]"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                          <span>DEPOSITAR</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 7: RELATÓRIOS */}
          {activeTab === "relatorios" && (
            <motion.div
              key="relatorios"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-[#00C8FF] font-mono tracking-widest uppercase font-semibold">Relatórios</span>
                  <h3 className="text-lg font-display font-black text-white mt-0.5">EMISSÃO DE DOCUMENTOS E EXTRATOS</h3>
                </div>
                {/* Period Selector */}
                <div className="flex gap-1.5 bg-[#111827] border border-white/5 p-1 rounded-lg">
                  {[
                    { label: "Mensal", val: "monthly" },
                    { label: "Trimestral", val: "quarterly" },
                    { label: "Anual", val: "yearly" }
                  ].map((p) => (
                    <button
                      key={p.val}
                      onClick={() => setReportPeriod(p.val as any)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${reportPeriod === p.val ? 'bg-[#00C8FF] text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generation panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Generation control card */}
                <div className="lg:col-span-1 glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-display font-black text-gray-400 uppercase tracking-widest mb-3">Parâmetros</h4>
                    <p className="text-xs text-gray-400 leading-relaxed font-sans mb-4">
                      Nosso sistema consolida de forma inteligente o fechamento de caixa, as variações de score e metas cumpridas para o período selecionado.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleExportData("pdf")}
                      className="w-full py-2.5 bg-gradient-to-r from-[#FF0F7B] to-[#FF4D4F] text-white font-extrabold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exportar como PDF</span>
                    </button>
                    <button
                      onClick={() => handleExportData("excel")}
                      className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-lg border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>Exportar Planilha Excel</span>
                    </button>
                    <button
                      onClick={() => handleExportData("csv")}
                      className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-lg border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-cyan-400" />
                      <span>Exportar CSV Puro</span>
                    </button>
                  </div>
                </div>

                {/* History of generated reports */}
                <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/5">
                  <h4 className="text-xs font-display font-black text-gray-400 uppercase tracking-widest mb-4">Relatórios Emitidos</h4>
                  <div className="space-y-3">
                    {generatedReports.length === 0 ? (
                      <p className="text-xs text-gray-500 py-12 text-center">Nenhum relatório emitido para esta sessão.</p>
                    ) : (
                      generatedReports.map((rep) => (
                        <div key={rep.id} className="p-3 bg-[#0d121f]/50 border border-white/5 rounded-xl flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <FilePieChart className="w-5 h-5 text-[#00C8FF]" />
                            <div>
                              <p className="text-xs text-white font-bold">{rep.title}</p>
                              <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">Gerado em: {new Date(rep.generatedAt).toLocaleDateString("pt-BR")}</span>
                            </div>
                          </div>
                          <span className="text-[10px] uppercase font-mono text-emerald-400 bg-emerald-400/5 border border-emerald-400/10 px-2 py-0.5 rounded font-bold">Consolidado</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 8: IA PAGE */}
          {activeTab === "ia" && (
            <motion.div
              key="ia"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-[#00C8FF] font-mono tracking-widest uppercase font-semibold">Inteligência Artificial</span>
                  <h3 className="text-lg font-display font-black text-white mt-0.5">ASSISTENTE FINANCEIRO NEXFIN</h3>
                </div>
              </div>

              {/* Loss Diagnostic panel embedded directly */}
              <LossPanel 
                analysis={lossAnalysis} 
                onRefresh={handleGenerateAiLoss}
                loading={lossLoading}
              />
            </motion.div>
          )}

          {/* TAB 9: PERFIL (EDIT PROFILE SETTINGS) */}
          {activeTab === "perfil" && (
            <motion.div
              key="perfil"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div>
                  <span className="text-[10px] text-[#00C8FF] font-mono tracking-widest uppercase font-semibold">Credenciais</span>
                  <h3 className="text-lg font-display font-black text-white mt-0.5">PERFIL E CONFIGURAÇÕES</h3>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-[#FF4D4F]/10 hover:bg-[#FF4D4F]/20 text-[#FF4D4F] border border-[#FF4D4F]/20 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair do Perfil</span>
                </button>
              </div>

              {profile && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Photo Profile Widget */}
                  <div className="lg:col-span-1 glass-card rounded-2xl p-6 border border-white/5 text-center flex flex-col items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-2 border-[#00C8FF] overflow-hidden p-1 shadow-lg shadow-black">
                      <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover rounded-full" />
                    </div>
                    <h4 className="text-md font-display font-bold text-white mt-4">{profile.name}</h4>
                    <span className="text-xs text-gray-500 font-mono mt-0.5">{profile.email}</span>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 mt-4 bg-white/5 hover:bg-white/10 text-xs font-semibold rounded-lg border border-white/10 transition cursor-pointer"
                    >
                      Alterar Foto
                    </button>
                  </div>

                  {/* Settings Fields */}
                  <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/5">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      alert("Configurações atualizadas!");
                    }} className="space-y-4 text-left">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-400 text-xs font-semibold mb-1">Nome Completo</label>
                          <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => {
                              const updated = NexFinDatabase.updateProfile(profile.id, { name: e.target.value });
                              setProfile(updated);
                            }}
                            className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-sm text-white border border-white/5 focus:border-[#00C8FF] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 text-xs font-semibold mb-1">CPF</label>
                          <input
                            type="text"
                            value={profile.cpf}
                            onChange={(e) => {
                              const updated = NexFinDatabase.updateProfile(profile.id, { cpf: e.target.value });
                              setProfile(updated);
                            }}
                            className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-sm text-white border border-white/5 focus:border-[#00C8FF] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-400 text-xs font-semibold mb-1">Idioma</label>
                          <select
                            value={profile.language}
                            onChange={(e) => {
                              const updated = NexFinDatabase.updateProfile(profile.id, { language: e.target.value as any });
                              setProfile(updated);
                            }}
                            className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-sm text-white border border-white/5 focus:border-[#00C8FF] focus:outline-none"
                          >
                            <option value="pt">Português (Brasil)</option>
                            <option value="en">English (US)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-gray-400 text-xs font-semibold mb-1">Tema da Interface</label>
                          <select
                            value={profile.theme}
                            onChange={(e) => {
                              const updated = NexFinDatabase.updateProfile(profile.id, { theme: e.target.value as any });
                              setProfile(updated);
                            }}
                            className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-sm text-white border border-white/5 focus:border-[#00C8FF] focus:outline-none"
                          >
                            <option value="dark">Cosmic Dark (#070B13)</option>
                            <option value="light">Classic Light (Simulado)</option>
                          </select>
                        </div>
                      </div>

                      {/* Pref switches */}
                      <div className="pt-4 border-t border-white/5 space-y-3">
                        <h4 className="text-xs font-display font-black text-gray-400 uppercase tracking-widest">Preferências Globais</h4>
                        <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profile.preferences.notificationsEnabled}
                            onChange={(e) => {
                              const updated = NexFinDatabase.updateProfile(profile.id, {
                                preferences: { ...profile.preferences, notificationsEnabled: e.target.checked }
                              });
                              setProfile(updated);
                            }}
                            className="rounded border-white/5 bg-[#0d121f] text-[#00C8FF] focus:ring-0"
                          />
                          <span>Ativar notificações em tempo real e de vencimentos</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profile.preferences.realtimeSync}
                            onChange={(e) => {
                              const updated = NexFinDatabase.updateProfile(profile.id, {
                                preferences: { ...profile.preferences, realtimeSync: e.target.checked }
                              });
                              setProfile(updated);
                            }}
                            className="rounded border-white/5 bg-[#0d121f] text-[#00C8FF] focus:ring-0"
                          />
                          <span>Sincronizar base de dados automaticamente via Supabase Realtime</span>
                        </label>
                      </div>

                      {/* Onboarding and Reset Panel */}
                      <div className="pt-6 border-t border-white/5 space-y-4">
                        <h4 className="text-xs font-display font-black text-gray-400 uppercase tracking-widest">Ações do Sistema</h4>
                        
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setShowOnboarding(true);
                              setActiveTab("geral"); // Go to general to see the tour elements clearly if they want
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#00C8FF]/10 hover:bg-[#00C8FF]/20 text-[#00C8FF] border border-[#00C8FF]/30 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            <HelpCircle className="w-4 h-4" />
                            <span>Reabrir Tutorial Interativo</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("ATENÇÃO: Deseja realmente zerar o seu painel financeiro? Todas as receitas, despesas, metas, cartões e lançamentos serão apagados permanentemente e sincronizados com a nuvem.")) {
                                handleResetDashboard();
                                alert("Painel financeiro zerado com sucesso! Iniciando do zero absoluto.");
                              }
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Zerar Todos os Dados (Início Limpo)</span>
                          </button>
                        </div>
                      </div>

                    </form>
                  </div>

                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Speed Dial Floating Action Button (Lee component) */}
      <SpeedDial 
        onOpenEntity={(type) => setActiveFormType(type)}
        onOpenVoice={() => setShowVoiceModal(true)}
      />

      {/* Sidebar Navigation Drawer (DB component) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab as any)}
        user={profile}
        scoreData={score}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenAiDrawer={() => setShowAiModal(true)}
        pendingBoletosCount={calendarEvents.filter(e => e.status === "pending").length}
        onLogout={handleLogout}
      />

      {/* Voice / AI Quick Modal (Iee component) */}
      <VoiceModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onSaveTransaction={(tx) => {
          if (currentUser) {
            const added = NexFinDatabase.addTransaction(currentUser.id, {
              description: tx.description,
              amount: tx.amount,
              type: tx.type,
              category: tx.category,
              date: tx.date || new Date().toISOString().split("T")[0],
              status: tx.status || "paid",
              paymentMethod: (tx.paymentMethod as any) || "pix",
            });
            setTransactions(prev => [added, ...prev]);
            refreshAllData(currentUser.id);
            setRealtimeSynced(true);
            setTimeout(() => setRealtimeSynced(false), 2500);
          }
        }}
      />

      {/* Dynamic item creation modal form builder */}
      <AnimatePresence>
        {activeFormType && (
          <AddForms 
            type={activeFormType}
            onClose={() => {
              setActiveFormType(null);
              setEditingCard(null);
            }}
            onSave={handleSaveFormData}
            initialData={editingCard}
          />
        )}
      </AnimatePresence>

      {/* Full conversational slide out drawer AI Chat */}
      <AiChat 
        isOpen={showAiModal} 
        onClose={() => setShowAiModal(false)} 
        dataContext={{
          transactions,
          goals,
          budgets,
          investments,
          installments,
          calendarEvents,
          score
        }}
        chatHistory={aiHistory}
        onAddChatMessage={(role, content) => {
          if (currentUser) {
            const added = NexFinDatabase.addAiHistory(currentUser.id, role, content);
            setAiHistory(prev => [...prev, added]);
          }
        }}
        onClearChatHistory={() => {
          if (currentUser) {
            NexFinDatabase.clearAiHistory(currentUser.id);
            setAiHistory([]);
          }
        }}
      />

      {/* Interactive Onboarding Tutorial Modal */}
      <AnimatePresence>
        {showOnboarding && <Onboarding onClose={handleCloseOnboarding} />}
      </AnimatePresence>

      {/* Confirm Action Danger Alert Dialog (Zerar Painel) */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm glass-card rounded-xl p-6 border border-[#FF4D4F]/30 shadow-2xl text-center"
            >
              <Trash2 className="w-12 h-12 text-[#FF4D4F] mx-auto mb-3 animate-bounce" />
              <h3 className="text-md font-display font-black text-white uppercase tracking-wider">Zerar Painel Financeiro?</h3>
              <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed">
                Esta ação irá apagar todas as modificações atuais e redefinir o painel para o conjunto inicial de dados reais de demonstração. Esta ação é irreversível.
              </p>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleResetDashboard}
                  className="flex-1 py-2 bg-[#FF4D4F] hover:bg-red-600 text-black font-extrabold rounded-lg text-xs"
                >
                  Zerar e Reiniciar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Active Boleto Document Preview Modal */}
      <AnimatePresence>
        {activeBoleto && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-white text-gray-900 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden border border-white/10"
              id="printable-boleto-document"
            >
              {/* Header Controls (No Print) */}
              <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-200 no-print">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-gray-500 uppercase">NexFin Pay • Pix Integrado</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00C8FF]/10 hover:bg-[#00C8FF]/20 text-[#0088CC] border border-[#00C8FF]/30 rounded-lg text-xs font-black transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Salvar PDF / Imprimir</span>
                  </button>
                  <button
                    onClick={() => setActiveBoleto(null)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg text-xs font-bold transition cursor-pointer"
                    title="Fechar Visualização"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                    <span>Fechar</span>
                  </button>
                </div>
              </div>

              {/* Printable Receipt Block */}
              <div className="space-y-6 select-text printable-area">
                
                {/* Boleto Top Banner */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-gray-900 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-gradient-to-tr from-[#00C8FF] to-[#00BFFF] rounded-xl flex items-center justify-center shadow-md">
                      <span className="font-display font-black text-black text-lg tracking-tighter">N</span>
                    </div>
                    <div>
                      <h2 className="text-sm font-display font-black tracking-widest text-gray-900 uppercase">NEXFIN PAY</h2>
                      <p className="text-[9px] text-gray-500 font-mono">FINANCEIRO INTELIGENTE</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs font-bold text-gray-900 md:text-right">
                    <span className="bg-gray-100 border border-gray-200 px-2 py-1 rounded">341-7</span>
                    <span className="tracking-tighter">34191.79001 01043.513184 91020.150008 7 934500000</span>
                  </div>
                </div>

                {/* Billing Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs font-sans leading-relaxed">
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cedente / Emissor</p>
                    <p className="font-extrabold text-gray-900">NexFin Soluções de Pagamento S.A.</p>
                    <p className="text-gray-500 text-[11px]">CNPJ: 12.345.678/0001-90</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Sacado / Pagador</p>
                    <p className="font-extrabold text-gray-900">{currentUser?.name || 'Cliente NexFin'}</p>
                    <p className="text-gray-500 text-[11px] truncate">{currentUser?.email}</p>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Nosso Número</p>
                    <p className="font-mono font-bold text-gray-800">NF-{activeBoleto.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Emissão</p>
                    <p className="font-mono font-bold text-gray-800">{new Date().toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Vencimento</p>
                    <p className="font-mono font-extrabold text-[#CC092F]">{new Date(activeBoleto.date + "T00:00:00").toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Valor do Documento</p>
                    <p className="font-mono font-extrabold text-emerald-600 text-sm">R$ {activeBoleto.amount.toFixed(2)}</p>
                  </div>
                </div>

                {/* PIX INTEGRATION & CODE */}
                <div className="border border-dashed border-emerald-500/30 rounded-2xl p-6 bg-emerald-500/[0.02] flex flex-col md:flex-row items-center gap-6">
                  
                  {/* Dynamic Pix QR Code Vector Mockup */}
                  <div className="relative w-36 h-36 bg-white border-2 border-emerald-500/20 rounded-2xl p-2 shrink-0 shadow-sm flex items-center justify-center">
                    {/* SVG QR Code Mockup with beautiful, real Pix look */}
                    <svg viewBox="0 0 100 100" className="w-full h-full text-[#32B3A6]">
                      <rect x="0" y="0" width="22" height="22" fill="currentColor" />
                      <rect x="2" y="2" width="18" height="18" fill="white" />
                      <rect x="5" y="5" width="12" height="12" fill="currentColor" />

                      <rect x="78" y="0" width="22" height="22" fill="currentColor" />
                      <rect x="80" y="2" width="18" height="18" fill="white" />
                      <rect x="83" y="5" width="12" height="12" fill="currentColor" />

                      <rect x="0" y="78" width="22" height="22" fill="currentColor" />
                      <rect x="2" y="78" width="18" height="18" fill="white" />
                      <rect x="5" y="81" width="12" height="12" fill="currentColor" />

                      {/* Random pixel squares */}
                      <rect x="30" y="5" width="8" height="8" fill="currentColor" />
                      <rect x="45" y="10" width="12" height="4" fill="currentColor" />
                      <rect x="65" y="8" width="6" height="10" fill="currentColor" />
                      
                      <rect x="30" y="30" width="10" height="6" fill="currentColor" />
                      <rect x="50" y="35" width="8" height="12" fill="currentColor" />
                      <rect x="70" y="28" width="15" height="4" fill="currentColor" />

                      <rect x="32" y="50" width="14" height="8" fill="currentColor" />
                      <rect x="55" y="52" width="18" height="6" fill="currentColor" />
                      <rect x="80" y="48" width="12" height="10" fill="currentColor" />

                      <rect x="28" y="70" width="10" height="12" fill="currentColor" />
                      <rect x="45" y="75" width="15" height="6" fill="currentColor" />
                      <rect x="68" y="65" width="10" height="15" fill="currentColor" />

                      <rect x="80" y="78" width="10" height="10" fill="currentColor" />

                      {/* Centered PIX logo badge */}
                      <rect x="36" y="36" width="28" height="28" rx="4" fill="white" stroke="#32B3A6" strokeWidth="1.5" />
                      <g transform="translate(42, 42) scale(0.6)">
                        <path d="M12,2 L22,12 L12,22 L2,12 Z" fill="#32B3A6" />
                        <circle cx="12" cy="12" r="3" fill="white" />
                      </g>
                    </svg>
                    <div className="absolute -bottom-2 px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-mono font-bold rounded uppercase tracking-wider">
                      Pix Oficial
                    </div>
                  </div>

                  {/* Pix Instructions & Copy button */}
                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-emerald-600">⚡</span>
                      </div>
                      <h4 className="text-xs font-bold text-emerald-900 font-display">PAGUE VIA PIX (MAIS RÁPIDO)</h4>
                    </div>
                    <p className="text-[11px] text-gray-500 font-sans leading-relaxed">
                      Escaneie o QR Code ao lado ou copie o código Copia e Cola abaixo para pagar instantaneamente de forma segura através do aplicativo do seu banco.
                    </p>

                    {/* Pix copy area */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`00020101021226870014br.gov.bcb.pix2565pix-qrcode.nexfin.com/pay/bill_${activeBoleto.id}5204000053039865405${activeBoleto.amount.toFixed(2)}5802BR5915NexFin S.A.6009Sao Paulo62070503***6304BF4E`}
                        className="flex-1 bg-gray-50 text-gray-700 font-mono text-[9px] rounded-lg px-3 py-2 border border-gray-200 outline-none select-all truncate"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`00020101021226870014br.gov.bcb.pix2565pix-qrcode.nexfin.com/pay/bill_${activeBoleto.id}5204000053039865405${activeBoleto.amount.toFixed(2)}5802BR5915NexFin S.A.6009Sao Paulo62070503***6304BF4E`);
                          setCopiedPix(true);
                          setTimeout(() => setCopiedPix(false), 2500);
                          NexFinDatabase.addNotification(currentUser!.id, "info", "Código Pix Copiado", "O código Pix Copia e Cola foi copiado para sua área de transferência.");
                        }}
                        className="px-3 py-2 bg-[#32B3A6] hover:bg-[#289287] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPix ? "Copiado!" : "Copiar Código"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* INSTRUCTIONS */}
                <div className="border-t border-gray-200 pt-4 text-[11px] text-gray-500 space-y-2 leading-relaxed">
                  <p className="font-bold text-gray-700 uppercase tracking-wider text-[9px]">Instruções de Pagamento:</p>
                  <ul className="list-disc pl-4 space-y-1 font-sans">
                    <li>Aceito em qualquer banco, internet banking, casa lotérica ou caixa eletrônico até a data de vencimento.</li>
                    <li>Este é um demonstrativo autêntico de cobrança do ecossistema inteligente de finanças NexFin.</li>
                    <li>Após o pagamento via Pix, a compensação e quitação ocorrem instantaneamente no sistema NexFin.</li>
                  </ul>
                </div>

                {/* BARCODE SECTION */}
                <div className="border-t-2 border-gray-900 pt-6 flex flex-col items-center text-center space-y-3">
                  {/* Fake realistic Barcode lines */}
                  <div className="flex items-center justify-center gap-0.5 h-12 w-full max-w-md bg-white p-1">
                    {Array.from({ length: 55 }).map((_, i) => {
                      const width = [1, 2, 3, 1, 4, 2, 1][i % 7];
                      return (
                        <div
                          key={i}
                          className="bg-black h-full shrink-0"
                          style={{ width: `${width}px` }}
                        />
                      );
                    })}
                  </div>
                  <p className="text-[10px] font-mono tracking-widest text-gray-900 font-semibold uppercase">Autenticação Mecânica • NexFin Pay Authenticated</p>
                </div>

                {/* Bottom action bar (No Print) */}
                <div className="flex justify-center items-center gap-3 pt-6 border-t border-gray-200 no-print">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#00C8FF] hover:bg-[#00B0E0] text-black font-extrabold rounded-xl text-xs transition cursor-pointer shadow-md"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Salvar PDF / Imprimir</span>
                  </button>
                  <button
                    onClick={() => setActiveBoleto(null)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-xl text-xs font-extrabold transition cursor-pointer"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                    <span>Fechar</span>
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Active Financial Report PDF / Printable Modal (Bee component) */}
      <PrintableReportModal 
        data={activeReport}
        onClose={() => setActiveReport(null)}
      />

    </div>
  );
}
