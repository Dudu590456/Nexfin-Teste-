"use client";

import React, { useState } from "react";
import { Plus, Mic, ArrowUpRight, ArrowDownRight, Calendar, Target, TrendingUp, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SpeedDialProps {
  onOpenEntity: (type: string) => void;
  onOpenVoice: () => void;
}

export default function SpeedDial({ onOpenEntity, onOpenVoice }: SpeedDialProps) {
  const [isOpen, setIsOpen] = useState(false);

  const items = [
    {
      id: "voice",
      isVoice: true,
      label: "Lançamento por Voz (IA) 🎙️",
      icon: Mic,
      color: "bg-gradient-to-r from-[#00C8FF] to-[#00BFFF] text-black shadow-[#00C8FF]/40",
    },
    {
      id: "income",
      type: "income",
      label: "Receita",
      icon: ArrowUpRight,
      color: "bg-emerald-500 text-black shadow-emerald-500/30",
    },
    {
      id: "expense",
      type: "expense",
      label: "Despesa",
      icon: ArrowDownRight,
      color: "bg-rose-500 text-black shadow-rose-500/30",
    },
    {
      id: "calendar_event",
      type: "calendar_event",
      label: "Boleto / Agendamento",
      icon: Calendar,
      color: "bg-amber-500 text-black shadow-amber-500/30",
    },
    {
      id: "goal",
      type: "goal",
      label: "Meta",
      icon: Target,
      color: "bg-[#00C8FF] text-black shadow-[#00C8FF]/30",
    },
    {
      id: "investment",
      type: "investment",
      label: "Investimento",
      icon: TrendingUp,
      color: "bg-indigo-500 text-white shadow-indigo-500/30",
    },
    {
      id: "installment",
      type: "installment",
      label: "Parcelamento",
      icon: CreditCard,
      color: "bg-purple-500 text-white shadow-purple-500/30",
    },
  ];

  return (
    <div id="floating-speed-dial" className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Expanding Dial Options */}
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end gap-2.5 mb-3">
            {items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => {
                    setIsOpen(false);
                    if (item.isVoice) {
                      onOpenVoice();
                    } else if (item.type) {
                      onOpenEntity(item.type);
                    }
                  }}
                >
                  <span className="bg-[#111827]/95 border border-white/10 text-gray-200 text-xs px-2.5 py-1 rounded-lg shadow-lg font-medium whitespace-nowrap backdrop-blur-md group-hover:text-white group-hover:border-[#00C8FF]/40 transition">
                    {item.label}
                  </span>
                  <button
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer ${item.color}`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <button
        id="speed-dial-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-13 h-13 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer ${
          isOpen
            ? "bg-rose-500 text-black rotate-45 shadow-rose-500/40"
            : "bg-gradient-to-tr from-[#00C8FF] to-[#00BFFF] text-black hover:scale-105 shadow-[0_0_25px_rgba(0,200,255,0.4)]"
        }`}
        title={isOpen ? "Fechar menu" : "Novo registro"}
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>
    </div>
  );
}
