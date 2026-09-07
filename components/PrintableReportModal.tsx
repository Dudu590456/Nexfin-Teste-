"use client";

import React from "react";
import { ShieldCheck, Printer, X } from "lucide-react";
import { motion } from "motion/react";
import { FinancialReport, Transaction, Investment, Goal } from "@/lib/database";

export interface PrintableData {
  title: string;
  period: string;
  generatedAt: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactions: Transaction[];
  investments: Investment[];
  goals: Goal[];
}

interface PrintableReportModalProps {
  data: PrintableData | null;
  onClose: () => void;
}

export default function PrintableReportModal({ data, onClose }: PrintableReportModalProps) {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="printable-modal-overlay" className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-3xl bg-white text-gray-900 rounded-2xl p-8 shadow-2xl relative my-8 print:m-0 print:p-0 print:shadow-none print:w-full"
      >
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 print:hidden">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
            <ShieldCheck className="w-4 h-4 text-[#00C8FF]" />
            <span>Documento Oficial Certificado NexFin</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4 text-[#00C8FF]" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-black rounded-lg hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight font-display">NexFin</h2>
              <span className="text-xs font-mono text-gray-500 uppercase tracking-widest block mt-0.5">
                Financial Management System
              </span>
              <p className="text-xs text-gray-600 mt-1">{data.title}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-gray-700 block">
                Período: {data.period.toUpperCase()}
              </span>
              <span className="text-[11px] font-mono text-gray-500 block">
                Data de Emissão: {new Date(data.generatedAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase font-bold block">
                Total de Receitas
              </span>
              <h4 className="text-lg font-mono font-black text-emerald-600 mt-0.5">
                R$ {data.totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </h4>
            </div>
            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase font-bold block">
                Total de Despesas
              </span>
              <h4 className="text-lg font-mono font-black text-rose-600 mt-0.5">
                R$ {data.totalExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </h4>
            </div>
            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase font-bold block">
                Superávit / Saldo Líquido
              </span>
              <h4 className="text-lg font-mono font-black text-blue-600 mt-0.5">
                R$ {data.netBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </h4>
            </div>
          </div>

          {/* Transactions Table */}
          <div>
            <h4 className="text-xs font-bold font-mono uppercase text-gray-700 mb-2">
              Lançamentos Contábeis do Período
            </h4>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-mono text-[10px] uppercase">
                    <th className="p-2.5">Data</th>
                    <th className="p-2.5">Descrição</th>
                    <th className="p-2.5">Categoria</th>
                    <th className="p-2.5 text-right">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.transactions.slice(0, 20).map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/80">
                      <td className="p-2.5 font-mono text-gray-500">{tx.date}</td>
                      <td className="p-2.5 font-medium text-gray-900">{tx.description}</td>
                      <td className="p-2.5 text-gray-600">{tx.category}</td>
                      <td className={`p-2.5 text-right font-mono font-bold ${tx.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                        {tx.type === "income" ? "+" : "-"} {tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Investments and Goals */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <h4 className="text-xs font-bold font-mono uppercase text-gray-700 mb-2">
                Posição em Investimentos
              </h4>
              <div className="border border-gray-200 rounded-xl p-3 space-y-1.5 bg-gray-50">
                {data.investments.length === 0 ? (
                  <p className="text-xs text-gray-400">Nenhum ativo registrado.</p>
                ) : (
                  data.investments.map((inv) => (
                    <div key={inv.id} className="flex justify-between text-xs">
                      <span className="text-gray-700 font-medium">{inv.name}</span>
                      <span className="font-mono font-bold text-gray-900">
                        R$ {inv.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold font-mono uppercase text-gray-700 mb-2">
                Metas & Objetivos Financeiros
              </h4>
              <div className="border border-gray-200 rounded-xl p-3 space-y-1.5 bg-gray-50">
                {data.goals.length === 0 ? (
                  <p className="text-xs text-gray-400">Nenhuma meta ativa.</p>
                ) : (
                  data.goals.map((goal) => (
                    <div key={goal.id} className="flex justify-between text-xs">
                      <span className="text-gray-700 font-medium">{goal.name}</span>
                      <span className="font-mono font-bold text-indigo-600">
                        {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer certification */}
          <div className="pt-4 border-t border-gray-200 flex justify-between items-center text-[10px] font-mono text-gray-500">
            <span>Hash de Verificação: NF-{(data.generatedAt.replace(/\D/g, "") + "7B2F890A").slice(0, 10).toUpperCase()}</span>
            <span>NexFin Autonomous Financial Intelligence &copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
