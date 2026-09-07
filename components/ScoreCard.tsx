"use-client";

import React from "react";
import { FinancialScore } from "@/lib/database";
import { Info, Sparkles, CheckCircle2, AlertTriangle, ArrowUpRight } from "lucide-react";

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
  let desc = "Você está com as finanças extremamente organizadas e sob controle.";

  if (!hasData) {
    color = "text-gray-500 animate-pulse";
    strokeColor = "rgba(255,255,255,0.1)";
    statusText = "Aguardando dados";
    desc = "Adicione suas primeiras receitas ou despesas para iniciar o cálculo inteligente do seu Score Financeiro.";
  } else if (score < 50) {
    color = "text-[#FF4D4F]";
    strokeColor = "#FF4D4F";
    statusText = "Crítico";
    desc = "Atenção necessária. Seus gastos excedem limites ou há contas vencidas.";
  } else if (score < 80) {
    color = "text-[#FF0F7B]";
    strokeColor = "#FF0F7B";
    statusText = "Regular";
    desc = "Bom controle, mas com margem para aumentar economia ou bater metas.";
  }

  // Calculate SVG stroke offset for the semi-circle dial gauge
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = !hasData ? circumference : (circumference - (score / 100) * circumference);

  return (
    <div id="score-card-main-container" className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row gap-6 items-center">
      
      {/* Visual Dial Gauge */}
      <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="stroke-white/5"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Foreground progress path with neon shadow style */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`text-4xl font-mono font-black ${color}`}>{hasData ? score : "--"}</span>
          <span className="text-[10px] text-gray-500 font-semibold tracking-wider font-sans uppercase">Score</span>
        </div>
      </div>

      {/* Details & Health summary */}
      <div className="flex-1">
        <div className="flex justify-between items-start gap-2 mb-2">
          <div>
            <span className="text-[10px] text-[#00C8FF] font-mono tracking-widest font-semibold uppercase block">Saúde Financeira</span>
            <h4 className="text-lg font-display font-extrabold text-white mt-0.5 flex items-center gap-1.5">
              Estado: <span className={color}>{statusText}</span>
            </h4>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-500 uppercase block font-semibold">Quanto Falta</span>
            <span className="text-xs font-mono font-bold text-gray-300">{hasData ? `+${100 - score} pts para o topo` : "--"}</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-400 font-sans leading-relaxed mb-4">
          {desc}
        </p>

        {/* Breakdown of factors */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Organização", val: hasData ? details.organization : 0, icon: "🎯" },
            { label: "Controle de Gastos", val: hasData ? details.control : 0, icon: "📉" },
            { label: "Economia", val: hasData ? details.savings : 0, icon: "💰" },
            { label: "Reserva Financeira", val: hasData ? details.reserve : 0, icon: "🛡️" },
            { label: "Cumprir Metas", val: hasData ? details.goals : 0, icon: "🚀" },
            { label: "Pontualidade", val: hasData ? details.punctuality : 0, icon: "📅" },
          ].map((factor, idx) => (
            <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-lg p-2 flex flex-col justify-between">
              <div className="flex justify-between items-center text-[10px] text-gray-400 font-sans">
                <span>{factor.icon} {factor.label}</span>
                <span className="font-mono font-bold text-white">{factor.val}%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1.5">
                <div 
                  className={`h-full rounded-full ${factor.val >= 80 ? 'bg-[#00C8FF]' : factor.val >= 50 ? 'bg-[#FF0F7B]' : 'bg-[#FF4D4F]'}`}
                  style={{ width: `${factor.val}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* AI Recommendations */}
        {suggestions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-1 text-[10px] text-[#00C8FF] font-mono tracking-wider font-semibold uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Como melhorar o seu Score</span>
            </div>
            <ul className="space-y-1.5">
              {suggestions.map((s, idx) => (
                <li key={idx} className="text-xs text-gray-400 flex items-start gap-1.5 font-sans leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00C8FF] shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

    </div>
  );
}
