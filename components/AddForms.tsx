"use-client";

import React, { useState } from "react";
import { X, ArrowUpRight, ArrowDownRight, Target, Briefcase, CreditCard, Calendar, Check, Landmark, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AddFormsProps {
  type: string;
  onClose: () => void;
  onSave: (dataType: string, data: any) => void;
  initialData?: any;
}

export default function AddForms({ type, onClose, onSave, initialData }: AddFormsProps) {
  // Helper to determine gradient color based on bank/card name
  const getCardColor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("nubank") || n.includes("nu ")) return "from-[#8A05BE] to-[#5c0082]";
    if (n.includes("itau") || n.includes("itaú")) return "from-[#FF7000] to-[#E65100]";
    if (n.includes("bradesco")) return "from-[#CC092F] to-[#8F031E]";
    if (n.includes("santander")) return "from-[#EC0000] to-[#B30000]";
    if (n.includes("inter")) return "from-[#FF7A00] to-[#E55E00]";
    if (n.includes("c6") || n.includes("c6bank")) return "from-[#111111] to-[#2E2E2E]";
    if (n.includes("caixa")) return "from-[#1060AA] to-[#0A4078]";
    if (n.includes("brasil") || n.includes("bb") || n.includes("banco do brasil")) return "from-[#FFE600] to-[#00529C]";
    return "from-[#1F2937] to-[#111827]";
  };

  // Common states initialized with initialData if editing
  const [amount, setAmount] = useState(initialData?.limit?.toString() || initialData?.amount?.toString() || "");
  const [description, setDescription] = useState(initialData?.description || initialData?.title || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [date, setDate] = useState(initialData?.date || initialData?.firstDueDate || new Date().toISOString().split("T")[0]);

  // Goal states
  const [goalName, setGoalName] = useState(initialData?.name || "");
  const [targetAmount, setTargetAmount] = useState(initialData?.targetAmount?.toString() || "");
  const [deadline, setDeadline] = useState(initialData?.deadline || "");

  // Investment states
  const [investName, setInvestName] = useState(initialData?.name || "");
  const [yieldRate, setYieldRate] = useState(initialData?.yieldRate || "");

  // Installment states
  const [installmentsCount, setInstallmentsCount] = useState(initialData?.installmentsCount?.toString() || "12");

  // Event states
  const [eventType, setEventType] = useState<"income" | "expense">(initialData?.type || "expense");
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false);

  // Card specific states
  const [cardName, setCardName] = useState(initialData?.name || "");
  const [cardExpiry, setCardExpiry] = useState(initialData?.expiry || "");
  const [cardLastFour, setCardLastFour] = useState(initialData?.lastFour || "");

  // Attachment states
  const [attachmentName, setAttachmentName] = useState("");

  // Helper to parse currency inputs with support for Brazilian formats (1.250,50 or 150,50 or 150.50)
  const parseFinancialInput = (val: any, fallback = 0): number => {
    if (typeof val === "number") return isNaN(val) ? fallback : Math.round(val * 100) / 100;
    if (!val) return fallback;
    let str = String(val).trim();
    if (str.includes(",") && str.includes(".")) {
      str = str.replace(/\./g, "").replace(",", ".");
    } else if (str.includes(",")) {
      str = str.replace(",", ".");
    }
    const parsed = parseFloat(str);
    return isNaN(parsed) ? fallback : Math.round(parsed * 100) / 100;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFinancialInput(amount, 0);

    if (type === "income" || type === "expense") {
      onSave("transaction", {
        type,
        category: category || "Outros",
        amount: numAmount,
        description: description || (type === "income" ? "Receita avulsa" : "Despesa avulsa"),
        date,
        status: "paid",
      });
    } else if (type === "goal") {
      onSave("goal", {
        name: goalName || "Meta de Economia",
        targetAmount: parseFinancialInput(targetAmount, 1000),
        currentAmount: parseFinancialInput(initialData?.currentAmount, 0),
        category: category || "Metas",
        deadline: deadline || new Date().toISOString().split("T")[0],
      });
    } else if (type === "investment") {
      onSave("investment", {
        name: investName || "Investimento Geral",
        category: category || "Renda Fixa",
        amount: numAmount,
        yieldRate: yieldRate || "CDI",
        date,
      });
    } else if (type === "installment") {
      const total = parseFinancialInput(amount, 1200);
      const count = Math.max(1, parseInt(String(installmentsCount)) || 12);
      const partAmount = Math.round((total / count) * 100) / 100;
      onSave("installment", {
        description: description || "Compra Parcelada",
        totalAmount: total,
        installmentsCount: count,
        installmentAmount: partAmount,
        category: category || "Tecnologia",
        firstDueDate: date,
      });
    } else if (type === "calendar_event" || type === "reminder") {
      onSave("calendar_event", {
        title: description || "Lembrete Geral",
        amount: numAmount,
        type: eventType,
        date,
        status: "pending",
        isRecurring,
      });
    } else if (type === "card") {
      onSave("card", {
        id: initialData?.id,
        name: cardName || "Cartão Geral",
        limit: parseFinancialInput(amount, 5000),
        expiry: cardExpiry || "12/32",
        lastFour: cardLastFour || "4321",
        color: getCardColor(cardName),
        currentSpent: parseFinancialInput(initialData?.currentSpent, 0),
      });
    } else {
      // General fallbacks for note, document, category, planning
      onSave("transaction", {
        type: "expense",
        category: "Geral",
        amount: numAmount || 10,
        description: description || `Registro de ${type}`,
        date,
        status: "paid",
      });
    }
    onClose();
  };

  const getTitle = () => {
    switch (type) {
      case "income": return "Adicionar Receita";
      case "expense": return "Adicionar Despesa";
      case "goal": return "Criar Nova Meta";
      case "investment": return "Registrar Investimento";
      case "installment": return "Cadastrar Parcelamento";
      case "calendar_event": return "Agendar Evento Calendário";
      case "reminder": return "Criar Lembrete";
      case "document": return "Anexar Documento";
      case "note": return "Salvar Anotação";
      case "card": return initialData ? "Editar Cartão de Crédito" : "Adicionar Cartão de Crédito";
      default: return "Adicionar Registro";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "income": return <ArrowUpRight className="w-5 h-5 text-emerald-400" />;
      case "expense": return <ArrowDownRight className="w-5 h-5 text-rose-400" />;
      case "goal": return <Target className="w-5 h-5 text-[#00C8FF]" />;
      case "investment": return <Briefcase className="w-5 h-5 text-[#00BFFF]" />;
      case "installment": return <CreditCard className="w-5 h-5 text-purple-400" />;
      case "card": return <CreditCard className="w-5 h-5 text-[#00C8FF]" />;
      default: return <Calendar className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div id="add-form-overlay" className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md glass-card rounded-2xl border border-white/10 p-6 shadow-2xl relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              {getIcon()}
            </div>
            <h3 className="text-md font-display font-black text-white">{getTitle()}</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition p-1 rounded-full hover:bg-white/5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Form fields */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          {/* General Incomes / Expenses fields */}
          {(type === "income" || type === "expense" || type === "investment" || type === "installment" || type === "calendar_event" || type === "reminder" || type === "card") && (
            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1">
                {type === "card" ? "Limite de Crédito (R$)" : "Valor (R$)"}
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={type === "card" ? "5000" : "1.250,00"}
                className="w-full bg-[#0d121f] rounded-lg px-3 py-2.5 text-base border border-white/5 focus:border-[#00C8FF] focus:outline-none text-white font-mono"
              />
            </div>
          )}

          {/* Card unique inputs */}
          {type === "card" && (
            <>
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1">Nome do Banco / Cartão</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Ex: Nubank, Itaú Personalité, Bradesco, C6 Carbon..."
                  className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-sm border border-white/5 focus:border-[#00C8FF] focus:outline-none text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1">Últimos 4 Dígitos</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={cardLastFour}
                    onChange={(e) => setCardLastFour(e.target.value.replace(/\D/g, ""))}
                    placeholder="Ex: 8899"
                    className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-sm border border-white/5 focus:border-[#00C8FF] focus:outline-none text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1">Validade (MM/AA)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val.length === 2 && !val.includes("/")) val += "/";
                      setCardExpiry(val);
                    }}
                    placeholder="Ex: 12/32"
                    className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-sm border border-white/5 focus:border-[#00C8FF] focus:outline-none text-white font-mono"
                  />
                </div>
              </div>
            </>
          )}

          {/* Description fields for transactions, installment, reminders */}
          {(type === "income" || type === "expense" || type === "installment" || type === "calendar_event" || type === "reminder" || type === "note") && (
            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1">Descrição</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Supermercado do mês, Salário extra, Academia..."
                className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-sm border border-white/5 focus:border-[#00C8FF] focus:outline-none text-white"
              />
            </div>
          )}

          {/* Category Dropdowns */}
          {(type === "income" || type === "expense" || type === "installment") && (
            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-xs border border-white/5 focus:border-[#00C8FF] focus:outline-none text-white"
              >
                <option value="">Selecione...</option>
                {type === "income" ? (
                  <>
                    <option value="Salário">Salário</option>
                    <option value="Investimentos">Investimentos / Rendimentos</option>
                    <option value="Freelance">Freelance / Serviços</option>
                    <option value="Outros">Outros Ingressos</option>
                  </>
                ) : (
                  <>
                    <option value="Moradia">Moradia (Aluguel, Luz)</option>
                    <option value="Alimentação">Alimentação</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Lazer">Lazer</option>
                    <option value="Assinaturas">Assinaturas / Serviços</option>
                    <option value="Tecnologia">Tecnologia / Hardware</option>
                    <option value="Outros">Outros</option>
                  </>
                )}
              </select>
            </div>
          )}

          {/* Goal unique inputs */}
          {type === "goal" && (
            <>
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1">Nome do Objetivo</label>
                <input
                  type="text"
                  required
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="Ex: Viagem para o Japão, Carro Novo..."
                  className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-sm border border-white/5 focus:border-[#00C8FF] focus:outline-none text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1">Meta (R$)</label>
                  <input
                    type="number"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="30000"
                    className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-sm border border-white/5 focus:border-[#00C8FF] focus:outline-none text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1">Categoria</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ex: Viagem, Sonhos"
                    className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-sm border border-white/5 focus:border-[#00C8FF] focus:outline-none text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1">Prazo Final</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-sm border border-white/5 focus:border-[#00C8FF] focus:outline-none text-white"
                />
              </div>
            </>
          )}

          {/* Investment inputs */}
          {type === "investment" && (
            <>
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1">Nome do Ativo</label>
                <input
                  type="text"
                  required
                  value={investName}
                  onChange={(e) => setInvestName(e.target.value)}
                  placeholder="Ex: Tesouro SELIC 2029, Bitcoin, FII ALZR11..."
                  className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-sm border border-white/5 focus:border-[#00C8FF] focus:outline-none text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1">Categoria do Ativo</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-xs border border-white/5 focus:border-[#00C8FF] focus:outline-none text-white"
                  >
                    <option value="Renda Fixa">Renda Fixa</option>
                    <option value="Ações">Ações</option>
                    <option value="Fundos Imobiliários">Fundos Imobiliários</option>
                    <option value="Criptoativos">Criptoativos</option>
                    <option value="Multimercado">Multimercado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1">Rendimento (ex: CDI)</label>
                  <input
                    type="text"
                    value={yieldRate}
                    onChange={(e) => setYieldRate(e.target.value)}
                    placeholder="100% CDI, 12% a.a."
                    className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-sm border border-white/5 focus:border-[#00C8FF] focus:outline-none text-white"
                  />
                </div>
              </div>
            </>
          )}

          {/* Installment unique count input */}
          {type === "installment" && (
            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1">Quantidade de Parcelas</label>
              <input
                type="number"
                required
                value={installmentsCount}
                onChange={(e) => setInstallmentsCount(e.target.value)}
                placeholder="12"
                className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-sm border border-white/5 focus:border-[#00C8FF] focus:outline-none text-white font-mono"
              />
            </div>
          )}

          {/* Event toggle types */}
          {(type === "calendar_event" || type === "reminder") && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1">Tipo de Evento</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEventType("expense")}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${eventType === "expense" ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-white/5 border-transparent text-gray-400'}`}
                  >
                    Saída / Conta
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventType("income")}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${eventType === "income" ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-transparent text-gray-400'}`}
                  >
                    Entrada
                  </button>
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer py-2">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="rounded border-white/5 bg-[#0d121f] text-[#00C8FF] focus:ring-0"
                  />
                  <span>Recorrente Mensal</span>
                </label>
              </div>
            </div>
          )}

          {/* Date Picker */}
          {type !== "goal" && type !== "document" && type !== "note" && type !== "card" && (
            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1">Data</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-sm border border-white/5 focus:border-[#00C8FF] focus:outline-none text-white font-mono"
              />
            </div>
          )}

          {/* Submit/Save Button */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-[#00C8FF] to-[#00BFFF] hover:brightness-110 text-black font-extrabold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3px]" />
              <span>Salvar Dados</span>
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
