"use client";

import React from "react";
import { FinancialScore } from "@/lib/database";
import { Sparkles, CheckCircle2, Activity, ShieldCheck, AlertCircle, HelpCircle } from "lucide-react";

interface ScoreCardProps {
  scoreData: FinancialScore;
  hasData?: boolean;
}

export default function ScoreCard({ scoreData, hasData = true }: ScoreCardProps) {
  const { score, details, suggestions } = scoreData;

  // Determine health state and styling
  let color = "text-[#00C8FF]";
  let strokeColor = "#00C8FF";
  let statusText = "Excelente";
  let badgeStyle = "bg-[#00C8FF]/10 text-[#00C8FF] border-[#00C8FF]/30";
  let desc = "Suas finanças estão organizadas, com bom controle e economia constante.";

  if (!hasData) {
    color = "text-gray-400";
    strokeColor = "rgba(255,255,255,0.12)";
    statusText = "Aguardando dados";
    badgeStyle = "bg-white/5 text-gray-400 border-white/10";
    desc = "Adicione suas receitas ou despesas para iniciar o cálculo inteligente do Score.";
  } else if (score < 50) {
    color = "text-[#FF4D4F]";
    strokeColor = "#FF4D4F";
    statusText = "Crítico";
    badgeStyle = "bg-[#FF4D4F]/10 text-[#FF4D4F] border-[#FF4D4F]/30";
    desc = "Atenção necessária. Despesas excedendo limites ou contas em atraso.";
  } else if (score < 80) {
    color = "text-amber-400";
    strokeColor = "#F59E0B";
    statusText = "Regular";
    badgeStyle = "bg-amber-400/10 text-amber-400 border-amber-400/30";
    desc = "Bom controle geral. Há margem para poupar mais e antecipar metas.";
  }

  // Circular gauge calculations (viewBox 0 0 100 100)
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76
  const validScore = Math.min(100, Math.max(0, score || 0));
  const strokeDashoffset = !hasData ? circumference : (circumference - (validScore / 100) * circumference);

  // Breakdown of evaluated pillars with compact labels designed specifically for narrow cards
  const factors = [
    { label: "Organização", fullName: "Organização financeira geral", val: hasData ? details.organization : 0, icon: "🎯" },
    { label: "Controle", fullName: "Controle de despesas e limites", val: hasData ? details.control : 0, icon: "📉" },
    { label: "Economia", fullName: "Capacidade de poupança mensal", val: hasData ? details.savings : 0, icon: "💰" },
    { label: "Reserva", fullName: "Reserva de emergência", val: hasData ? details.reserve : 0, icon: "🛡️" },
    { label: "Metas", fullName: "Cumprimento de metas patrimoniais", val: hasData ? details.goals : 0, icon: "🚀" },
    { label: "Pontual", fullName: "Pontualidade nos pagamentos", val: hasData ? details.punctuality : 0, icon: "📅" },
  ];

  return (
    <div 
      id="score-card-main-container" 
      className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between w-full h-full shadow-lg overflow-hidden"
    >
      {/* 1. Header with title & status badge */}
      <div className="flex items-start justify-between gap-2 pb-3.5 border-b border-white/5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#00C8FF]/10 border border-[#00C8FF]/20 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4 text-[#00C8FF]" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-[#00C8FF] font-mono tracking-widest font-bold uppercase block truncate">
              Saúde Financeira
            </span>
            <h4 className="text-sm font-display font-extrabold text-white leading-tight truncate">
              Diagnóstico NexFin
            </h4>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border shrink-0 ${badgeStyle}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
          <span className="truncate max-w-[120px]">{statusText}</span>
        </span>
      </div>

      {/* 2. Dial and Score summary (Horizontal side-by-side inside card) */}
      <div className="flex items-center gap-4 py-4">
        {/* SVG Circular Gauge */}
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background track circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-white/5"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Animated progress circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke={strokeColor}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className={`text-2xl font-mono font-black tracking-tight leading-none ${color}`}>
              {hasData ? score : "--"}
            </span>
            <span className="text-[9px] text-gray-400 font-mono font-bold uppercase tracking-wider mt-0.5">
              Score
            </span>
          </div>
        </div>

        {/* Score Context */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-baseline justify-between gap-1 mb-1">
            <span className="text-[11px] text-gray-400 font-sans">Meta:</span>
            <span className="text-xs font-mono font-bold text-cyan-300 truncate">
              {hasData 
                ? (score >= 100 ? "Pontuação máxima!" : `+${100 - score} pts para o topo`) 
                : "0 de 100 pts"}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-sans leading-relaxed line-clamp-3">
            {desc}
          </p>
        </div>
      </div>

      {/* 3. Breakdown of 6 Factors (2 columns, compact and guaranteed not to overflow) */}
      <div className="pt-3 border-t border-white/5 space-y-2">
        <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono uppercase tracking-wider">
          <span>Pilares Avaliados</span>
          <span className="text-gray-500 font-sans normal-case text-[11px]">6 critérios</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {factors.map((factor, idx) => (
            <div 
              key={idx} 
              className="bg-white/[0.02] border border-white/5 rounded-xl p-2 flex flex-col justify-between hover:bg-white/[0.04] transition"
              title={factor.fullName}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="text-xs shrink-0 select-none">{factor.icon}</span>
                  <span className="text-[11px] text-gray-300 font-medium truncate">
                    {factor.label}
                  </span>
                </div>
                <span className="font-mono text-[11px] font-bold text-white shrink-0">
                  {factor.val}%
                </span>
              </div>
              
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-1.5">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    factor.val >= 80 ? 'bg-[#00C8FF]' : factor.val >= 50 ? 'bg-amber-400' : 'bg-[#FF4D4F]'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, factor.val))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. AI Recommendations */}
      {suggestions && suggestions.length > 0 && (
        <div className="pt-3 mt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-[10px] text-[#00C8FF] font-mono tracking-wider font-semibold uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00C8FF] shrink-0" />
            <span className="truncate">Como melhorar o seu Score</span>
          </div>
          <ul className="space-y-1.5">
            {suggestions.slice(0, 2).map((s, idx) => (
              <li key={idx} className="text-xs text-gray-400 flex items-start gap-1.5 font-sans leading-relaxed">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00C8FF] shrink-0 mt-0.5" />
                <span className="break-words min-w-0 flex-1 text-[11px] leading-snug">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
