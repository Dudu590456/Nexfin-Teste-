"use-client";

import React, { useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle, Info, Sparkles, Plus, RefreshCw, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface SmartAlert {
  id: string;
  type: "danger" | "warning" | "info" | "success";
  title: string;
  description: string;
  category: string;
  potentialSavings?: string;
}

interface RadarAlertsProps {
  alerts: SmartAlert[];
  onAddAlert: (alert: Omit<SmartAlert, "id">) => void;
  onRemoveAlert: (id: string) => void;
  onGenerateAiAlerts: () => void;
  aiLoading: boolean;
}

export default function RadarAlerts({
  alerts,
  onAddAlert,
  onRemoveAlert,
  onGenerateAiAlerts,
  aiLoading,
}: RadarAlertsProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<SmartAlert["type"]>("warning");
  const [newCategory, setNewCategory] = useState("Assinaturas");
  const [newSavings, setNewSavings] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    onAddAlert({
      type: newType,
      title: newTitle,
      description: newDesc,
      category: newCategory,
      potentialSavings: newSavings || undefined,
    });

    // Reset and close
    setNewTitle("");
    setNewDesc("");
    setNewType("warning");
    setNewCategory("Assinaturas");
    setNewSavings("");
    setShowAddModal(false);
  };

  return (
    <div id="radar-alerts-block" className="relative border-2 border-cyan-500/30 bg-[#111827]/70 backdrop-blur-xl rounded-2xl p-6 shadow-[0_0_25px_rgba(0,200,255,0.08)]">
      
      {/* Header bar aligned with reference image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          {/* Pulsing Alert Light */}
          <span className="relative flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0F7B] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-[#FF0F7B] shadow-[0_0_12px_#FF0F7B]"></span>
          </span>

          <h3 className="font-display font-black text-sm tracking-wider text-white uppercase flex items-center gap-2">
            🔔 RADAR DE ALERTAS INTELIGENTES
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Generate via AI button */}
          <button
            onClick={onGenerateAiAlerts}
            disabled={aiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827]/80 hover:bg-white/5 border border-white/10 rounded-lg text-xs text-[#00C8FF] hover:border-[#00C8FF]/50 transition cursor-pointer"
          >
            {aiLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Sincronizar IA</span>
          </button>

          {/* "+ Novo Alerta" button matching mockup color */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#00C8FF] hover:bg-[#00BFFF] text-black font-extrabold text-xs rounded-lg transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3px]" />
            <span>+ NOVO ALERTA</span>
          </button>

          {/* "Mutável" Live Sensor indicator */}
          <div className="px-3 py-1.5 rounded-lg border border-white/10 text-[9px] font-mono tracking-widest text-gray-400 font-bold uppercase flex items-center gap-1.5 bg-[#0d121f]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            MUTÁVEL • LIVE SENSOR
          </div>
        </div>
      </div>

      {/* Alerts content box */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-xl p-8 text-center bg-[#070B13]/30">
            <p className="text-gray-400 text-xs font-sans">
              Nenhum alerta ativo no radar. Clique em &quot;+ Novo Alerta&quot; para inocular avisos ou sincronize com a IA.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {alerts.map((alert) => {
                let badgeColor = "bg-[#FF0F7B]/10 text-[#FF0F7B] border-[#FF0F7B]/20";
                let Icon = AlertCircle;

                if (alert.type === "warning") {
                  badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                  Icon = AlertTriangle;
                } else if (alert.type === "success") {
                  badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                  Icon = CheckCircle;
                } else if (alert.type === "info") {
                  badgeColor = "bg-sky-500/10 text-sky-400 border-sky-500/20";
                  Icon = Info;
                }

                return (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`flex items-start gap-3 p-4 rounded-xl border bg-white/[0.01] ${
                      alert.type === "danger" ? "border-[#FF0F7B]/10" : "border-white/5"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${badgeColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                          {alert.category}
                        </span>
                        <button
                          onClick={() => onRemoveAlert(alert.id)}
                          className="text-gray-600 hover:text-[#FF4D4F] transition p-0.5 rounded-md hover:bg-white/5"
                          title="Remover alerta"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-0.5 truncate">{alert.title}</h4>
                      <p className="text-[11px] text-gray-400 mt-1 font-sans leading-relaxed">
                        {alert.description}
                      </p>
                      {alert.potentialSavings && (
                        <div className="mt-2 text-[10px] font-mono text-[#00C8FF] flex items-center gap-1 bg-[#00C8FF]/5 px-2 py-0.5 rounded border border-[#00C8FF]/10 w-fit">
                          <span>Economia estimada: R$ {alert.potentialSavings}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Manual "+ Novo Alerta" Modal overlay */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-card rounded-xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-display font-bold text-white mb-4">Inocular Novo Alerta no Radar</h3>

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1">Título do Alerta</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Assinatura Duplicada Detectada"
                    className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-sm border border-white/5 focus:border-[#00C8FF] focus:outline-none text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1">Descrição</label>
                  <textarea
                    required
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Ex: Identificamos cobranças duplicadas do Adobe Creative Suite na fatura metal."
                    className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-sm border border-white/5 focus:border-[#00C8FF] focus:outline-none text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-xs font-semibold mb-1">Severidade</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as SmartAlert["type"])}
                      className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-xs border border-white/5 focus:border-[#00C8FF] focus:outline-none text-white"
                    >
                      <option value="danger">Crítico (Vermelho)</option>
                      <option value="warning">Aviso (Amarelo)</option>
                      <option value="info">Informativo (Azul)</option>
                      <option value="success">Sucesso (Verde)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-xs font-semibold mb-1">Categoria</label>
                    <input
                      type="text"
                      required
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Ex: Assinaturas, Cartão"
                      className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-xs border border-white/5 focus:border-[#00C8FF] focus:outline-none text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1">
                    Economia Estimada (Opcional, ex: 120,00)
                  </label>
                  <input
                    type="text"
                    value={newSavings}
                    onChange={(e) => setNewSavings(e.target.value)}
                    placeholder="Ex: 85,90"
                    className="w-full bg-[#0d121f] rounded-lg px-3 py-2 text-sm border border-white/5 focus:border-[#00C8FF] focus:outline-none text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-white/5 text-white hover:bg-white/10 rounded-lg text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00C8FF] text-black font-extrabold rounded-lg text-xs hover:bg-[#00BFFF]"
                  >
                    Salvar Alerta
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
