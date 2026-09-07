"use-client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, Bot, User, Send, MessageSquare, AlertCircle, Trash2, ArrowDownRight, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
}

interface AiChatProps {
  isOpen: boolean;
  onClose: () => void;
  dataContext: any; // All user financial records
  chatHistory: ChatMessage[];
  onAddChatMessage: (role: "user" | "model", message: string) => void;
  onClearChatHistory: () => void;
}

const PRESET_CHIPS = [
  "Onde estou perdendo dinheiro?",
  "Quanto posso economizar este mês?",
  "Como posso melhorar meu Score?",
  "Qual conta devo pagar primeiro?",
  "Quanto posso gastar de forma segura hoje?",
  "Posso comprar um celular de R$ 5.000 hoje?",
  "Como estão meus investimentos?",
];

export default function AiChat({
  isOpen,
  onClose,
  dataContext,
  chatHistory,
  onAddChatMessage,
  onClearChatHistory,
}: AiChatProps) {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on updates
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isOpen]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    setError("");

    // Add user message to state
    onAddChatMessage("user", textToSend);
    setInputText("");
    setLoading(true);

    try {
      // Structure chat context
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "chat",
          dataContext,
          message: textToSend,
          history: chatHistory,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      onAddChatMessage("model", data.text || "Desculpe, não consegui obter uma resposta.");
    } catch (err: any) {
      console.error("AI Chat Error:", err);
      setError("Erro de comunicação com o assistente AI. Verifique se sua chave API do Gemini está configurada.");
      onAddChatMessage("model", "Houve um erro técnico ao processar sua solicitação de IA. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Chat Drawer panel slide out from right */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#111827] border-l border-white/10 shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-[#0d121f] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#00C8FF] to-[#00BFFF] flex items-center justify-center shadow-[0_0_15px_rgba(0,200,255,0.2)]">
                  <Bot className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-[#00C8FF] font-black">NexFin AI</h3>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Wealth Advisor Ativo
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Clear chat logs */}
                <button
                  onClick={onClearChatHistory}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition"
                  title="Limpar Histórico"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {/* Close */}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Error alerts */}
            {error && (
              <div className="mx-4 mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center h-full py-12 px-6">
                  <div className="w-16 h-16 rounded-full bg-[#00C8FF]/10 flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-[#00C8FF]" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Conselheiro Financeiro IA</h4>
                  <p className="text-xs text-gray-400 mt-2 max-w-xs leading-relaxed font-sans">
                    Como estão minhas contas? Onde posso economizar? Selecione uma das perguntas prontas abaixo ou digite sua dúvida.
                  </p>
                </div>
              ) : (
                chatHistory.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {/* Avatar */}
                      {!isUser && (
                        <div className="w-7 h-7 rounded-md bg-[#00C8FF]/10 border border-[#00C8FF]/20 flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4 text-[#00C8FF]" />
                        </div>
                      )}

                      <div
                        className={`rounded-xl p-3 max-w-[80%] text-xs leading-relaxed font-sans ${
                          isUser
                            ? "bg-gradient-to-br from-[#00C8FF] to-[#00BFFF] text-black font-semibold"
                            : "glass-card border border-white/5 text-gray-300"
                        }`}
                      >
                        {msg.content}
                      </div>

                      {isUser && (
                        <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-md bg-[#00C8FF]/10 border border-[#00C8FF]/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-[#00C8FF]" />
                  </div>
                  <div className="glass-card border border-white/5 rounded-xl p-3 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00C8FF] animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00C8FF] animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00C8FF] animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Preset chips wrapper */}
            <div className="px-4 py-2 border-t border-white/5 bg-[#0d121f]/30 shrink-0">
              <span className="text-[9px] font-mono tracking-widest text-gray-500 uppercase block mb-1.5">Sugestões de Análise</span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {PRESET_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    disabled={loading}
                    onClick={() => sendMessage(chip)}
                    className="shrink-0 px-2.5 py-1 rounded-full border border-white/5 bg-[#0d121f] hover:border-[#00C8FF]/30 text-[10px] text-gray-300 hover:text-[#00C8FF] transition cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-white/5 bg-[#0d121f] shrink-0">
              <form onSubmit={handleFormSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={loading}
                  placeholder="Pergunte ao consultor de patrimônio..."
                  className="flex-1 bg-[#070B13] border border-white/5 rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00C8FF] transition"
                />
                <button
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className="w-10 h-10 rounded-lg bg-[#00C8FF] hover:bg-[#00BFFF] text-black flex items-center justify-center shrink-0 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
