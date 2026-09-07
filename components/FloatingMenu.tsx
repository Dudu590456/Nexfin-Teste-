"use-client";

import React, { useState } from "react";
import { Plus, ArrowUpRight, ArrowDownRight, Target, Briefcase, CreditCard, FileText, Bookmark, FolderOpen, Bell, Calendar, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FloatingMenuProps {
  onSelectItem: (type: string) => void;
}

const MENU_ITEMS = [
  { label: "Receita", type: "income", icon: ArrowUpRight, color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { label: "Despesa", type: "expense", icon: ArrowDownRight, color: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
  { label: "Meta", type: "goal", icon: Target, color: "bg-[#00C8FF]/20 text-[#00C8FF] border-[#00C8FF]/30" },
  { label: "Investimento", type: "investment", icon: Briefcase, color: "bg-[#00BFFF]/20 text-[#00BFFF] border-[#00BFFF]/30" },
  { label: "Parcelamento", type: "installment", icon: CreditCard, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { label: "Documento", type: "document", icon: FileText, color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
  { label: "Anotação", type: "note", icon: Bookmark, color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { label: "Categoria", type: "category", icon: FolderOpen, color: "bg-teal-500/20 text-teal-400 border-teal-500/30" },
  { label: "Lembrete", type: "reminder", icon: Bell, color: "bg-[#FF0F7B]/20 text-[#FF0F7B] border-[#FF0F7B]/30" },
  { label: "Calendário", type: "calendar_event", icon: Calendar, color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
];

export default function FloatingMenu({ onSelectItem }: FloatingMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = (type: string) => {
    onSelectItem(type);
    setIsOpen(false);
  };

  return (
    <div id="floating-menu-wrapper" className="fixed bottom-24 right-8 z-[90]">
      {/* Expanding Dial Menu backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Modal glass backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[89]"
            />

            {/* Menu Circle / Panel aligned to the right */}
            <motion.div 
              initial={{ scale: 0.8, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute bottom-16 right-0 w-80 glass-card border border-white/10 rounded-2xl p-5 shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-[90]"
            >
              <div className="text-center mb-3">
                <h4 className="text-xs font-display font-black tracking-wider text-gray-400 uppercase">Novo Registro</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Selecione o tipo de dado financeiro para salvar</p>
              </div>

              {/* Grid Layout of options */}
              <div className="grid grid-cols-3 gap-3">
                {MENU_ITEMS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleItemClick(item.type)}
                      className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-white/5 bg-[#0d121f]/50 hover:bg-[#0d121f] hover:border-cyan-500/30 transition group cursor-pointer text-center"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${item.color} group-hover:scale-110 transition duration-300`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] text-gray-300 group-hover:text-white font-semibold mt-1.5 truncate w-full">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main floating triggers button */}
      <motion.button
        id="quick-floating-action-button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#00C8FF] to-[#00BFFF] flex items-center justify-center shadow-[0_0_25px_rgba(0,200,255,0.4)] hover:shadow-[0_0_35px_rgba(0,200,255,0.6)] cursor-pointer z-[91] relative transition-transform"
        animate={{ rotate: isOpen ? 135 : 0 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-8 h-8 text-black stroke-[3px]" />
      </motion.button>
    </div>
  );
}
