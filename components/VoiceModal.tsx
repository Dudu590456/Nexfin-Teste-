"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Sparkles, X, Check, Loader2, ArrowRight, AlertCircle, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ParsedTransaction {
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  paymentMethod?: string;
  notes?: string;
}

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTransaction: (tx: {
    description: string;
    amount: number;
    type: "income" | "expense";
    category: string;
    date?: string;
    status?: "paid" | "pending";
    paymentMethod?: string;
  }) => void;
}

export default function VoiceModal({ isOpen, onClose, onSaveTransaction }: VoiceModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedTransaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualText, setManualText] = useState("");
  const [speechSupported] = useState(() => {
    if (typeof window !== "undefined") {
      return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    }
    return false;
  });

  const recognitionRef = useRef<any>(null);

  const quickExamples = [
    "Gastei 45 no almoço no cartão",
    "Recebi 1500 de salário no pix",
    "Paguei 180 de conta de luz no boleto",
    "Comprei remédio na farmácia por 35 no débito",
    "Abasteci 120 de gasolina no crédito",
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "pt-BR";

      recognition.onstart = () => {
        setIsRecording(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let current = "";
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
        setManualText(current);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsRecording(false);
        if (event.error === "not-allowed") {
          setError("Permissão de microfone negada. Você pode digitar sua frase abaixo.");
        } else if (event.error !== "no-speech") {
          setError("Não foi possível capturar o áudio. Tente novamente ou digite a frase.");
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn("SpeechRecognition init error:", err);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const handleClose = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    setIsRecording(false);
    setTranscript("");
    setManualText("");
    setParsed(null);
    setError(null);
    onClose();
  };

  const toggleRecording = () => {
    setError(null);
    if (!speechSupported || !recognitionRef.current) {
      setError("Reconhecimento de voz não suportado pelo navegador. Digite sua frase abaixo.");
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsRecording(false);
      if (transcript.trim()) {
        processText(transcript);
      }
    } else {
      setTranscript("");
      setParsed(null);
      try {
        recognitionRef.current.start();
      } catch (err) {
        setError("Não foi possível iniciar o microfone. Tente digitar sua frase abaixo.");
      }
    }
  };

  const processText = async (text: string) => {
    if (!text || !text.trim()) {
      setError("Por favor fale ou digite algo sobre seu gasto ou ganho.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/gemini/parse-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.success && data.transaction) {
        setParsed(data.transaction);
      } else {
        throw new Error(data.error || "Não foi possível interpretar a frase");
      }
    } catch (err: any) {
      // Fallback
      const lower = text.toLowerCase();
      const numMatch = lower.match(/(\d+(?:[.,]\d{1,2})?)/);
      const amount = numMatch ? parseFloat(numMatch[1].replace(",", ".")) : 50;
      const isIncome = /recebi|ganhei|sal[aá]rio|rendimento|vendi|pix/i.test(lower);

      setParsed({
        type: isIncome ? "income" : "expense",
        amount: amount > 0 ? amount : 50,
        description: isIncome ? "Recebimento Rápido" : "Gasto Rápido",
        category: lower.includes("almoço") || lower.includes("mercado") ? "Alimentação" : "Outros",
        paymentMethod: lower.includes("cartão") ? "credit" : "pix",
        notes: text,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!parsed) return;
    onSaveTransaction({
      description: parsed.description,
      amount: parsed.amount,
      type: parsed.type,
      category: parsed.category,
      date: new Date().toISOString().split("T")[0],
      status: "paid",
      paymentMethod: parsed.paymentMethod,
    });
    handleClose();
  };

  const handleQuickExample = (ex: string) => {
    setTranscript(ex);
    setManualText(ex);
    processText(ex);
  };

  if (!isOpen) return null;

  return (
    <div id="voice-quick-input-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        className="w-full max-w-lg bg-[#0d121f] border border-white/10 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-20 bg-[#00C8FF]/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00C8FF]/15 border border-[#00C8FF]/30 flex items-center justify-center text-[#00C8FF]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Lançamento por Voz & IA</h3>
              <p className="text-xs text-gray-400">Fale naturalmente ou digite para registrar gastos e ganhos</p>
            </div>
          </div>
          <button
            id="close-voice-modal-btn"
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="my-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Voice Trigger Section */}
        <div className="py-6 flex flex-col items-center justify-center text-center relative">
          <div className="relative mb-5 flex items-center justify-center">
            {isRecording && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                  className="absolute w-28 h-28 rounded-full bg-[#00C8FF]/20"
                />
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.2, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  className="absolute w-24 h-24 rounded-full bg-[#00C8FF]/30"
                />
              </>
            )}

            <button
              id="voice-mic-main-button"
              type="button"
              onClick={toggleRecording}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                isRecording
                  ? "bg-rose-500 text-white shadow-rose-500/40 scale-105 animate-pulse"
                  : "bg-gradient-to-tr from-[#00C8FF] to-[#00BFFF] text-black shadow-[#00C8FF]/30 hover:scale-105"
              }`}
              title={isRecording ? "Clique para parar de gravar" : "Clique para falar"}
            >
              <Mic className={`w-9 h-9 ${isRecording ? "animate-bounce" : ""}`} />
            </button>
          </div>

          <p className="text-sm font-semibold text-white">
            {isRecording ? (
              <span className="text-[#00C8FF] flex items-center justify-center gap-2">
                <Volume2 className="w-4 h-4 animate-pulse" />
                Ouvindo... Fale seu gasto ou ganho agora
              </span>
            ) : (
              "Toque no microfone para falar"
            )}
          </p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            Exemplo: <em>&ldquo;Gastei 45 no almoço no cartão&rdquo;</em> ou <em>&ldquo;Recebi 350 de um frete no pix&rdquo;</em>
          </p>

          {transcript && (
            <div className="mt-4 w-full p-3.5 rounded-xl bg-white/[0.04] border border-[#00C8FF]/30 text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-[#00C8FF] uppercase font-bold tracking-wider">
                  Transcrição em Tempo Real
                </span>
                {isRecording && (
                  <button
                    type="button"
                    onClick={() => {
                      if (recognitionRef.current) {
                        try {
                          recognitionRef.current.stop();
                        } catch {}
                      }
                      setIsRecording(false);
                      processText(transcript);
                    }}
                    className="text-[11px] font-bold text-[#00C8FF] hover:underline cursor-pointer"
                  >
                    Concluir e Processar
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-100 font-medium italic">&ldquo;{transcript}&rdquo;</p>
            </div>
          )}
        </div>

        {/* Manual text input */}
        <div className="mt-1 pt-3 border-t border-white/5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              processText(manualText);
            }}
            className="flex items-center gap-2"
          >
            <input
              id="voice-manual-text-input"
              type="text"
              placeholder="Ou digite/cole a frase aqui..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              className="flex-1 bg-[#070b14] border border-white/10 focus:border-[#00C8FF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none transition"
            />
            <button
              id="voice-process-text-btn"
              type="submit"
              disabled={loading || !manualText.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#00C8FF] text-black font-bold text-xs hover:brightness-110 disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Analisar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick chip suggestions */}
        {!parsed && !isRecording && (
          <div className="mt-3">
            <span className="text-[11px] text-gray-500 font-semibold block mb-1.5">
              Exemplos rápidos para testar:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickExamples.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickExample(ex)}
                  className="text-[11px] bg-white/[0.03] hover:bg-white/[0.08] text-gray-300 hover:text-[#00C8FF] border border-white/5 rounded-lg px-2.5 py-1 transition cursor-pointer"
                >
                  🗣️ {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Interpretation Preview Card */}
        {parsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl bg-gradient-to-br from-[#00C8FF]/10 via-[#0d172a] to-emerald-500/10 border border-[#00C8FF]/40 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#00C8FF] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Interpretação da IA
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  parsed.type === "income"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}
              >
                {parsed.type === "income" ? "+ Receita / Ganho" : "- Despesa / Gasto"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                <span className="text-gray-400 block text-[10px]">Valor</span>
                <span className="text-sm font-extrabold text-white font-mono">
                  R$ {parsed.amount.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                <span className="text-gray-400 block text-[10px]">Descrição</span>
                <span className="text-xs font-semibold text-white truncate block">
                  {parsed.description}
                </span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                <span className="text-gray-400 block text-[10px]">Categoria</span>
                <span className="text-xs font-semibold text-[#00C8FF]">
                  {parsed.category}
                </span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                <span className="text-gray-400 block text-[10px]">Forma de Pagamento</span>
                <span className="text-xs font-semibold text-gray-200 capitalize">
                  {parsed.paymentMethod || "pix"}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setParsed(null)}
                className="px-3 py-2 text-xs text-gray-400 hover:text-white rounded-lg transition"
              >
                Tentar Outra Frase
              </button>
              <button
                id="confirm-voice-transaction-btn"
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 bg-gradient-to-r from-[#00C8FF] to-[#00BFFF] hover:brightness-110 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-[#00C8FF]/20 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Confirmar e Lançar Agora</span>
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
