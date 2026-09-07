"use client";

import React, { useEffect } from "react";
import { 
  Home, TrendingUp, Calendar, CreditCard, FileText, Target, FilePieChart, Bot, User, 
  X, ChevronRight, Sparkles, LogOut, ShieldCheck, Zap, CheckSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, FinancialScore } from "@/lib/database";

export interface NavItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "geral", label: "Geral", description: "Painel executivo & score", icon: Home },
  { id: "fluxo", label: "Fluxo", description: "Extrato & movimentações", icon: TrendingUp },
  { id: "calendario", label: "Calendário", description: "Agenda & vencimentos", icon: Calendar },
  { id: "cartoes", label: "Cartões", description: "Faturas & parcelamentos", icon: CreditCard },
  { id: "boletos", label: "Boletos", description: "Contas a pagar & código", icon: FileText },
  { id: "metas", label: "Metas", description: "Objetivos de economia", icon: Target },
  { id: "notas", label: "Notas & Tarefas", description: "Checklists & anotações", icon: CheckSquare, badge: "Supabase", badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  { id: "relatorios", label: "Relatórios", description: "Demonstrativos contábeis", icon: FilePieChart },
  { id: "ia", label: "IA", description: "Consultor & otimizações", icon: Bot, badge: "Gemini", badgeColor: "bg-[#00C8FF]/15 text-[#00C8FF] border-[#00C8FF]/30" },
  { id: "perfil", label: "Perfil", description: "Configurações & dados", icon: User },
];

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  user?: UserProfile | null;
  scoreData?: FinancialScore | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAiDrawer: () => void;
  pendingBoletosCount?: number;
  onLogout?: () => void;
}

export default function Sidebar({
  activeTab,
  onSelectTab,
  user,
  scoreData,
  isOpen,
  onClose,
  onOpenAiDrawer,
  pendingBoletosCount = 0,
  onLogout,
}: SidebarProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const renderContent = () => (
    <div className="flex flex-col h-full bg-[#0d121f]">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div
          id="sidebar-brand-btn"
          onClick={() => {
            onSelectTab("geral");
            onClose();
          }}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00C8FF] to-[#00BFFF] flex items-center justify-center shadow-[0_0_20px_rgba(0,200,255,0.35)] group-hover:scale-105 transition-transform duration-300">
            <Zap className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-display font-black tracking-wider text-white">NexFin</span>
            </div>
            <span className="text-[10px] font-mono text-gray-400 block tracking-widest uppercase">
              Patrimônio Inteligente
            </span>
          </div>
        </div>

        <button
          id="close-sidebar-btn"
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/5 transition cursor-pointer"
          aria-label="Fechar menu lateral"
          title="Fechar menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Financial Health Score Widget */}
      <div className="px-4 pt-4 pb-2">
        <div
          id="sidebar-score-widget"
          onClick={() => {
            onSelectTab("geral");
            onClose();
          }}
          className="p-3 rounded-xl bg-gradient-to-r from-white/[0.03] to-[#00C8FF]/[0.04] border border-white/5 hover:border-[#00C8FF]/30 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00C8FF]" />
              <span className="font-mono text-[11px] uppercase tracking-wider">Score de Saúde</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#00C8FF] group-hover:underline">
              {scoreData?.score ?? 85} pts
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00C8FF] to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, scoreData?.score ?? 85))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
        <div className="px-3 pb-1 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
          Navegação Principal
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isPendingBoletos = item.id === "boletos" && pendingBoletosCount > 0;

          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => {
                onSelectTab(item.id);
                onClose();
              }}
              className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left cursor-pointer ${
                isActive ? "text-white font-medium bg-white/[0.04]" : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSidebarIndicator"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#00C8FF]/15 to-transparent border-l-2 border-[#00C8FF] -z-10 shadow-[inset_0_0_20px_rgba(0,200,255,0.06)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <div
                className={`p-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#00C8FF]/20 text-[#00C8FF]"
                    : "bg-white/[0.03] text-gray-400 group-hover:text-gray-200 group-hover:bg-white/[0.06]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm tracking-tight truncate ${isActive ? "text-white font-semibold" : "text-gray-300"}`}>
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  ) : isPendingBoletos ? (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {pendingBoletosCount} pend.
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">
                  {item.description}
                </p>
              </div>

              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${
                  isActive ? "text-[#00C8FF] opacity-100 translate-x-0.5" : "text-gray-600 opacity-0 group-hover:opacity-100"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Gemini AI Card */}
      <div className="p-3 border-t border-white/5">
        <div
          id="sidebar-gemini-card"
          onClick={() => {
            onOpenAiDrawer();
            onClose();
          }}
          className="p-3 rounded-xl bg-gradient-to-br from-[#00C8FF]/10 via-[#0d172a] to-[#9900ff]/10 border border-[#00C8FF]/30 hover:border-[#00C8FF]/60 transition-all cursor-pointer group shadow-lg shadow-[#00C8FF]/5"
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[#00C8FF] animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wide">Consultor Gemini IA</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-tight">
            Clique para consultar insights e tirar dúvidas sobre suas finanças em tempo real.
          </p>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-white/5 bg-[#090d18]/60">
        <div className="flex items-center gap-1.5">
          <div
            id="sidebar-user-profile-card"
            onClick={() => {
              onSelectTab("perfil");
              onClose();
            }}
            className="flex-1 flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition cursor-pointer group min-w-0"
          >
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
              alt={user?.name || "Usuário"}
              className="w-9 h-9 rounded-lg object-cover border border-[#00C8FF]/40 group-hover:scale-105 transition shrink-0"
              onError={(e: any) => {
                e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate group-hover:text-[#00C8FF] transition">
                {user?.name || "Usuário NexFin"}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {user?.email || "usuario@nexfin.com"}
              </p>
            </div>
          </div>

          {onLogout && (
            <button
              id="sidebar-logout-btn"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="p-2.5 rounded-xl hover:bg-rose-500/15 text-gray-400 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition cursor-pointer shrink-0"
              title="Sair da Conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="sidebar-drawer-container" className="fixed inset-0 z-50 flex">
          <motion.div
            id="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm cursor-pointer"
          />
          <motion.aside
            id="main-slideout-sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative w-80 max-w-[85vw] h-full bg-[#0d121f] border-r border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 flex flex-col"
          >
            {renderContent()}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
