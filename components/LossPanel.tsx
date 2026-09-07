"use-client";

import React from "react";
import { Sparkles, AlertCircle, TrendingDown, DollarSign, RefreshCw, Layers } from "lucide-react";
import { motion } from "motion/react";

export interface LossAnalysisData {
  scoreImpact: number;
  wastes: Array<{ category: string; amount: number; description: string }>;
  redundantSubscriptions: Array<{ name: string; amount: number; usage: string }>;
  possibleSavingsTotal: number;
  tips: string[];
}

interface LossPanelProps {
  analysis: LossAnalysisData;
  onRefresh: () => void;
  loading: boolean;
}

export default function LossPanel({ analysis, onRefresh, loading }: LossPanelProps) {
  const { scoreImpact, wastes, redundantSubscriptions, possibleSavingsTotal, tips } = analysis;

  return (
    <div id="loss-panel-container" className="glass-card rounded-2xl p-6 border border-[#FF0F7B]/10 shadow-[0_0_20px_rgba(255,15,123,0.03)] flex flex-col gap-6">
      
      {/* Title block */}
      <div className="flex justify-between items-start gap-4 pb-4 border-b border-white/5">
        <div>
          <span className="text-[10px] text-[#FF0F7B] font-mono tracking-widest font-semibold uppercase block">Diagnóstico Patrimonial</span>
          <h3 className="text-lg font-display font-black text-white mt-0.5 flex items-center gap-1.5">
            🚨 ONDE ESTOU PERDENDO DINHEIRO?
          </h3>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF0F7B]/10 hover:bg-[#FF0F7B]/20 border border-[#FF0F7B]/20 rounded-lg text-xs text-[#FF0F7B] hover:border-[#FF0F7B]/50 transition cursor-pointer font-bold"
        >
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-neon-magenta animate-pulse" />
          )}
          <span>Análise Diária IA</span>
        </button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Possible Savings */}
        <div className="bg-[#FF0F7B]/5 border border-[#FF0F7B]/10 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#FF0F7B]/10 border border-[#FF0F7B]/20 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6 text-[#FF0F7B]" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-semibold uppercase">Economia Possível Detectada</span>
            <p className="text-2xl font-mono font-black text-white mt-0.5">
              R$ {(Number(possibleSavingsTotal) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className="text-[10px] text-[#00C8FF] block mt-0.5 font-medium">Reinvestindo este valor você acelera suas metas</span>
          </div>
        </div>

        {/* Score Impact */}
        <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-semibold uppercase">Impacto Negativo no Score</span>
            <p className="text-2xl font-mono font-black text-amber-500 mt-0.5">-{scoreImpact} pontos</p>
            <span className="text-[10px] text-gray-400 block mt-0.5 font-medium">Pontos recuperáveis ao ajustar estes canais</span>
          </div>
        </div>
      </div>

      {/* Leaks breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Unnecessary Wastes & Spends */}
        <div className="space-y-3">
          <h4 className="text-xs font-display font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D4F]" />
            Vazamentos de Caixa Ativos
          </h4>
          <div className="space-y-2">
            {wastes.map((w, idx) => (
              <div key={idx} className="bg-white/[0.01] border border-white/5 rounded-lg p-3 flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-gray-500 uppercase">{w.category}</span>
                  <p className="text-xs text-white font-bold mt-0.5 leading-tight">{w.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-black text-[#FF4D4F]">
                    -R$ {(Number(w.amount) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[9px] text-gray-500 block uppercase font-medium">Estimado</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Redundant Subscriptions */}
        <div className="space-y-3">
          <h4 className="text-xs font-display font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Assinaturas Pouco Utilizadas
          </h4>
          <div className="space-y-2">
            {redundantSubscriptions.map((sub, idx) => (
              <div key={idx} className="bg-white/[0.01] border border-white/5 rounded-lg p-3 flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-gray-500 uppercase">Serviço</span>
                  <p className="text-xs text-white font-bold mt-0.5 leading-tight">{sub.name}</p>
                  <span className="text-[10px] text-amber-500 block mt-0.5">{sub.usage}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-black text-amber-400">
                    R$ {(Number(sub.amount) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[9px] text-gray-500 block uppercase font-medium">Mensal</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily tips block */}
      <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4">
        <h4 className="text-xs font-display font-extrabold text-[#00C8FF] uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Dicas Diárias do NexFin AI
        </h4>
        <ul className="space-y-2">
          {tips.map((tip, idx) => (
            <li key={idx} className="text-xs text-gray-400 flex items-start gap-2 font-sans leading-relaxed">
              <span className="w-5 h-5 rounded-md bg-[#00C8FF]/10 text-[#00C8FF] flex items-center justify-center shrink-0 text-[10px] font-mono mt-0.5">{idx + 1}</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
