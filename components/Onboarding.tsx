"use-client";

import React, { useState } from "react";
import { X, Sparkles, Plus, Calendar, FilePieChart, TrendingUp, Bot, Shield, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OnboardingProps {
  onClose: () => void;
}

const STEPS = [
  {
    title: "Bem-vindo ao NexFin Elite",
    description: "Sua nova central de inteligência patrimonial. Vamos fazer um breve tour interativo pelas principais funcionalidades para você atingir seu potencial máximo de controle financeiro.",
    icon: Sparkles,
    color: "from-[#00C8FF] to-[#00BFFF]",
    glow: "shadow-[0_0_30px_rgba(0,200,255,0.25)]",
  },
  {
    title: "Como Cadastrar Receitas e Despesas",
    description: "Utilize o botão central flutuante '+' a qualquer momento para abrir o menu rápido. Lá você pode adicionar Receitas, Despesas, Parcelamentos de alta fidelidade e anexar comprovantes.",
    icon: Plus,
    color: "from-[#00C8FF] to-[#FF0F7B]",
    glow: "shadow-[0_0_30px_rgba(0,200,255,0.15)]",
  },
  {
    title: "O Calendário Financeiro",
    description: "Agende suas contas recorrentes, parcelas e boletos. Defina lembretes de pagamento com visualizações flexíveis de Dia, Semana, Mês ou Ano, permitindo acessar anos anteriores e futuros.",
    icon: Calendar,
    color: "from-[#00BFFF] to-[#FF0F7B]",
    glow: "shadow-[0_0_30px_rgba(0,191,255,0.2)]",
  },
  {
    title: "Score e Saúde Financeira",
    description: "Acompanhe seu Score Financeiro dinâmico de 0 a 100. Nosso motor de cálculo avalia sua organização, controle de custos, volume de economia, fundos de reserva e pontualidade geral.",
    icon: TrendingUp,
    color: "from-[#00C8FF] to-[#00BFFF]",
    glow: "shadow-[0_0_30px_rgba(0,200,255,0.25)]",
  },
  {
    title: "Relatórios Inteligentes de Elite",
    description: "Gere relatórios automatizados Mensais, Trimestrais ou Anuais. Exporte seus dados patrimoniais com apenas um clique para formatos PDF, CSV ou planilhas Excel estruturadas.",
    icon: FilePieChart,
    color: "from-[#FF0F7B] to-[#FF4D4F]",
    glow: "shadow-[0_0_30px_rgba(255,15,123,0.2)]",
  },
  {
    title: "Converse com o Assistente IA",
    description: "Acesse o 'ANALISAR IA' para abrir o chat exclusivo. Nosso motor analisa sua base de dados real para te sugerir reduções de gastos desnecessários, otimizar sua reserva e indicar as contas a pagar primeiro.",
    icon: Bot,
    color: "from-[#00C8FF] to-[#FF0F7B]",
    glow: "shadow-[0_0_30px_rgba(0,200,255,0.3)]",
  },
];

export default function Onboarding({ onClose }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const StepIcon = STEPS[currentStep].icon;

  return (
    <div id="onboarding-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-[#00C8FF]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#FF0F7B]/10 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg glass-card border-neon-cyan rounded-2xl p-8 md:p-10 text-center overflow-hidden"
      >
        {/* Skip button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition p-1 rounded-full hover:bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Visual Counter */}
        <div className="flex justify-center gap-1.5 mb-8">
          {STEPS.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-[#00C8FF]' : 'w-2 bg-white/10'}`}
            />
          ))}
        </div>

        {/* Dynamic Icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${STEPS[currentStep].color} flex items-center justify-center ${STEPS[currentStep].glow}`}>
            <StepIcon className="w-8 h-8 text-black" />
          </div>
        </div>

        {/* Title & Description with AnimatePresence */}
        <div className="min-h-[140px] flex flex-col justify-center">
          <h3 className="text-2xl font-display font-extrabold text-white mb-3">
            {STEPS[currentStep].title}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto font-sans">
            {STEPS[currentStep].description}
          </p>
        </div>

        {/* Interactive action controls */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-lg transition ${currentStep === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 text-xs font-bold px-6 py-2.5 bg-gradient-to-r from-[#00C8FF] to-[#00BFFF] text-black rounded-lg hover:brightness-110 transition cursor-pointer"
          >
            <span>{currentStep === STEPS.length - 1 ? "Entrar no Painel" : "Próximo"}</span>
            {currentStep === STEPS.length - 1 ? (
              <CheckCircle2 className="w-4 h-4 ml-1" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
