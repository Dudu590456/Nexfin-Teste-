"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Mail, Lock, User, FileText, ArrowRight, AlertCircle, 
  CheckCircle2, RefreshCw, Eye, EyeOff, KeyRound, Clock, 
  ChevronLeft, Copy, Check, Zap, CheckCircle, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NexFinDatabase } from "@/lib/database";

interface AuthScreenProps {
  onAuthSuccess: (userId: string, email: string, name: string) => void;
}

type AuthMode = "login" | "signup" | "forgot" | "reset";

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  
  // Form fields
  const [email, setEmail] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("nexfin_remembered_email") || "edu.rocha785@gmail.com";
    }
    return "edu.rocha785@gmail.com";
  });
  const [password, setPassword] = useState("123456");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [rememberEmail, setRememberEmail] = useState(true);
  const [autoLoginAfterSignup, setAutoLoginAfterSignup] = useState(true);

  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States & feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Password Reset Specifics
  const [resetEmail, setResetEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [simulatedToken, setSimulatedToken] = useState("");
  const [isSandboxSimulation, setIsSandboxSimulation] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // 6-digit code inputs ref
  const codeInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Check active session on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeSession = localStorage.getItem("nexfin_active_user");
      if (activeSession) {
        try {
          const user = JSON.parse(activeSession);
          if (user?.id && user?.email) {
            onAuthSuccess(user.id, user.email, user.name || "Eduardo Rocha");
          }
        } catch {
          localStorage.removeItem("nexfin_active_user");
        }
      }
    }
  }, [onAuthSuccess]);

  // Handle countdown timer for code expiration / resend cooldown
  useEffect(() => {
    if (codeCountdown <= 0) return;
    const timer = setInterval(() => {
      setCodeCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [codeCountdown]);

  // Format CPF as 000.000.000-00
  const handleCpfChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    let formatted = digits;
    if (digits.length > 9) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    } else if (digits.length > 6) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }
    setCpf(formatted);
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    const hasMinLen = pass.length >= 6;
    const hasGreatLen = pass.length >= 10;
    const hasUppercase = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);

    let score = 0;
    if (hasMinLen) score += 25;
    if (hasGreatLen) score += 25;
    if (hasUppercase) score += 20;
    if (hasNumber) score += 15;
    if (hasSpecial) score += 15;

    let label = "Fraca";
    let color = "bg-rose-500";
    let textColor = "text-rose-400";
    if (score >= 80) {
      label = "Excelente";
      color = "bg-emerald-400";
      textColor = "text-emerald-400";
    } else if (score >= 50) {
      label = "Segura";
      color = "bg-cyan-400";
      textColor = "text-cyan-400";
    } else if (score >= 30) {
      label = "Média";
      color = "bg-amber-400";
      textColor = "text-amber-400";
    }

    return { score, label, color, textColor };
  };

  // 6-digit code input helpers
  const handleCodeInputChange = (index: number, value: string) => {
    const val = value.replace(/\D/g, "").slice(-1);
    const newCode = [...verificationCode];
    newCode[index] = val;
    setVerificationCode(newCode);

    if (val && index < 5) {
      codeInputsRef.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newCode = [...verificationCode];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pasted[i] || "";
    }
    setVerificationCode(newCode);
    const nextIdx = Math.min(pasted.length, 5);
    codeInputsRef.current[nextIdx]?.focus();
  };

  const fullCode = verificationCode.join("");

  // ===================== ROBUST LOGIN FLOW =====================
  const performLogin = async (targetEmail: string, targetPass: string) => {
    setError("");
    setSuccess("");

    const cleanEmail = targetEmail.toLowerCase().trim();
    if (!cleanEmail || !targetPass) {
      setError("Preencha o e-mail e a senha.");
      return;
    }

    setLoading(true);

    try {
      if (rememberEmail) {
        localStorage.setItem("nexfin_remembered_email", cleanEmail);
      } else {
        localStorage.removeItem("nexfin_remembered_email");
      }

      let loginSuccessful = false;
      let userData: any = null;

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, password: targetPass })
        });

        const res = await response.json();

        if (response.ok && res.success) {
          loginSuccessful = true;
          userData = res.user;

          if (res.data) {
            const s = res.data;
            if (s.profile) {
              const profiles = JSON.parse(localStorage.getItem("nexfin_profiles") || "[]");
              const idx = profiles.findIndex((p: any) => p.id === s.profile.id || p.email === s.profile.email);
              const mappedProfile = {
                id: s.profile.id,
                name: s.profile.name,
                email: s.profile.email,
                cpf: s.profile.cpf,
                avatar: s.profile.avatar,
                theme: s.profile.theme || "dark",
                language: s.profile.language || "pt",
                preferences: {
                  notificationsEnabled: s.profile.notificationsEnabled ?? true,
                  aiGrounding: s.profile.aiGrounding ?? true,
                  realtimeSync: s.profile.realtimeSync ?? true,
                }
              };
              if (idx !== -1) profiles[idx] = mappedProfile;
              else profiles.push(mappedProfile);
              localStorage.setItem("nexfin_profiles", JSON.stringify(profiles));
            }

            if (s.transactions) localStorage.setItem("nexfin_transactions", JSON.stringify(s.transactions));
            if (s.goals) localStorage.setItem("nexfin_goals", JSON.stringify(s.goals));
            if (s.budgets) localStorage.setItem("nexfin_budgets", JSON.stringify(s.budgets));
            if (s.investments) localStorage.setItem("nexfin_investments", JSON.stringify(s.investments));
            if (s.cards) localStorage.setItem("nexfin_cards", JSON.stringify(s.cards));
            if (s.installments) localStorage.setItem("nexfin_installments", JSON.stringify(s.installments));
            if (s.notifications) localStorage.setItem("nexfin_notifications", JSON.stringify(s.notifications));
            if (s.calendarEvents) localStorage.setItem("nexfin_calendar_events", JSON.stringify(s.calendarEvents));
            if (s.score) {
              const scores = JSON.parse(localStorage.getItem("nexfin_score_list") || "[]");
              const otherScores = scores.filter((item: any) => item.userId !== s.score.userId);
              localStorage.setItem("nexfin_score_list", JSON.stringify([...otherScores, s.score]));
            }
            if (s.aiHistory) localStorage.setItem("nexfin_ai_history", JSON.stringify(s.aiHistory));
            if (s.financialReports) localStorage.setItem("nexfin_financial_reports", JSON.stringify(s.financialReports));
          }
        }
      } catch (networkErr) {
        console.warn("Server API offline or unavailable, fallback to local vault:", networkErr);
      }

      // If server verified or fallback for demo/registered user
      if (!loginSuccessful) {
        const profiles = JSON.parse(localStorage.getItem("nexfin_profiles") || "[]");
        let found = profiles.find((p: any) => p.email.toLowerCase() === cleanEmail);

        // Always allow the principal demo user
        if (cleanEmail === "edu.rocha785@gmail.com") {
          found = {
            id: "user-123",
            name: "Eduardo Rocha",
            email: "edu.rocha785@gmail.com",
            cpf: "123.456.789-00",
            avatar: "https://picsum.photos/seed/eduardo/150/150",
            theme: "dark",
            language: "pt"
          };
          loginSuccessful = true;
          userData = found;
        } else if (found) {
          const storedPass = localStorage.getItem(`nexfin_pass_${cleanEmail}`);
          if (storedPass === targetPass || !storedPass) {
            loginSuccessful = true;
            userData = found;
          }
        } else {
          // Check active user or stored password
          const activeStr = localStorage.getItem("nexfin_active_user");
          let candidate = null;
          if (activeStr) {
            try {
              const parsed = JSON.parse(activeStr);
              if (parsed?.email?.toLowerCase() === cleanEmail) {
                candidate = parsed;
              }
            } catch (e) {}
          }
          const storedPass = localStorage.getItem(`nexfin_pass_${cleanEmail}`);
          if (storedPass === targetPass || (!storedPass && targetPass.length >= 6)) {
            userData = candidate || {
              id: "usr-" + Math.random().toString(36).substring(2, 9),
              name: cleanEmail.split("@")[0],
              email: cleanEmail,
              cpf: "",
              avatar: `https://picsum.photos/seed/${cleanEmail.split("@")[0]}/150/150`,
              theme: "dark",
              language: "pt"
            };
            loginSuccessful = true;
          }
        }
      }

      if (loginSuccessful && userData) {
        localStorage.setItem("nexfin_active_user", JSON.stringify(userData));
        localStorage.setItem(`nexfin_pass_${cleanEmail}`, targetPass);
        setSuccess("Acesso autorizado!");
        setTimeout(() => {
          onAuthSuccess(userData.id, userData.email, userData.name || "Usuário");
        }, 400);
      } else {
        setError("E-mail ou senha incorretos.");
      }
    } catch (err: any) {
      setError(err.message || "Erro durante autenticação.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  // Quick 1-click test drive
  const handleQuickDemoClick = () => {
    setEmail("edu.rocha785@gmail.com");
    setPassword("123456");
    performLogin("edu.rocha785@gmail.com", "123456");
  };

  // ===================== SIGNUP FLOW =====================
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanEmail = email.toLowerCase().trim();
    if (!name.trim() || !cleanEmail || !cpf || !password) {
      setError("Preencha todos os campos.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve conter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);
    try {
      const userId = "usr-" + Math.random().toString(36).substring(2, 9);
      
      const activeUser = {
        id: userId,
        name: name.trim() || "Usuário",
        email: cleanEmail,
        cpf,
        avatar: `https://picsum.photos/seed/${name.split(" ")[0].toLowerCase()}/150/150`,
        theme: "dark" as const,
        language: "pt" as const,
        preferences: {
          notificationsEnabled: true,
          aiGrounding: true,
          realtimeSync: true,
        }
      };

      // 1. Immediately store in local database & vault
      NexFinDatabase.updateProfile(userId, activeUser);
      NexFinDatabase.ensureUserSeeded(userId);
      localStorage.setItem(`nexfin_pass_${cleanEmail}`, password);
      localStorage.setItem("nexfin_remembered_email", cleanEmail);

      const profiles = JSON.parse(localStorage.getItem("nexfin_profiles") || "[]");
      const idx = profiles.findIndex((p: any) => p.email.toLowerCase() === cleanEmail);
      if (idx !== -1) {
        profiles[idx] = activeUser;
      } else {
        profiles.push(activeUser);
      }
      localStorage.setItem("nexfin_profiles", JSON.stringify(profiles));

      // 2. Server register sync
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: userId,
            name: name.trim(),
            email: cleanEmail,
            cpf,
            password
          })
        });
        const res = await response.json();
        if (res.user && res.user.id) {
          activeUser.id = res.user.id;
          if (res.user.name) activeUser.name = res.user.name;
        }
      } catch (err) {
        console.warn("Server register sync skipped:", err);
      }

      if (autoLoginAfterSignup) {
        localStorage.setItem("nexfin_active_user", JSON.stringify(activeUser));
        setSuccess("Conta criada com sucesso! Entrando...");
        setTimeout(() => {
          onAuthSuccess(activeUser.id, activeUser.email, activeUser.name);
        }, 350);
      } else {
        setSuccess("Conta criada com sucesso! Faça login abaixo.");
        setTimeout(() => {
          setMode("login");
        }, 800);
      }

    } catch (err: any) {
      setError(err.message || "Erro ao efetuar cadastro.");
    } finally {
      setLoading(false);
    }
  };

  // ===================== FORGOT PASSWORD (STEP 1) =====================
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanEmail = (resetEmail || email).toLowerCase().trim();
    if (!cleanEmail) {
      setError("Informe seu e-mail cadastrado.");
      return;
    }

    setResetEmail(cleanEmail);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao enviar código.");
      }

      setCodeCountdown(60);

      if (data.emailSent) {
        setIsSandboxSimulation(false);
        setSuccess(`Código enviado para ${cleanEmail}!`);
      } else {
        setSimulatedToken(data.code || "839214");
        setIsSandboxSimulation(true);
        setSuccess(`Código gerado para ${cleanEmail}!`);
      }

      setTimeout(() => {
        setMode("reset");
        setTimeout(() => codeInputsRef.current[0]?.focus(), 150);
      }, 500);
    } catch (err: any) {
      setError(err.message || "Erro ao solicitar código.");
    } finally {
      setLoading(false);
    }
  };

  // ===================== RESET PASSWORD (STEP 2) =====================
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (fullCode.length !== 6) {
      setError("Digite os 6 dígitos do código.");
      return;
    }

    if (!password) {
      setError("Digite a nova senha.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 dígitos.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      try {
        await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: resetEmail,
            code: fullCode,
            newPassword: password,
          })
        });
      } catch (e) {
        console.warn("Reset password API fallback:", e);
      }

      localStorage.setItem(`nexfin_pass_${resetEmail}`, password);
      
      setSuccess("Senha atualizada! Entrando...");
      setEmail(resetEmail);

      setTimeout(() => {
        performLogin(resetEmail, password);
      }, 600);

    } catch (err: any) {
      setError(err.message || "Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div id="auth-screen-container" className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#070B14] text-white relative overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* VIBRANT BACKGROUND WITH LUMINOUS COLORFUL LIGHT ORBS */}
      <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-cyan-500/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle Glowing Dot Matrix */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* CENTERED VIBRANT CARD */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Glowing Gradient Border Wrap */}
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-cyan-400/50 via-indigo-500/30 to-purple-600/40 shadow-[0_0_50px_-12px_rgba(6,182,212,0.3)]">
          
          <div className="rounded-[23px] bg-[#0E1526]/90 backdrop-blur-2xl p-6 sm:p-8 border border-white/10">
            
            {/* BRAND HEADER: VIBRANT & DIRECT */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/40 mb-3.5 ring-4 ring-cyan-400/20">
                <span className="font-mono font-black text-slate-950 text-2xl tracking-tighter">NX</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300">
                NEX<span className="text-cyan-400">FIN</span>
              </h1>
              
              <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-[11px] font-mono font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>COFRE FINANCEIRO PRIVADO</span>
              </div>
            </div>

            {/* TAB SELECTOR (LOGIN / CRIAR CONTA) */}
            {(mode === "login" || mode === "signup") && (
              <div className="mb-6 p-1 bg-slate-900/90 rounded-2xl flex border border-slate-800 shadow-inner">
                <button
                  type="button"
                  id="tab-login-btn"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setMode("login");
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    mode === "login"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30 font-extrabold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Entrar</span>
                </button>

                <button
                  type="button"
                  id="tab-signup-btn"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setMode("signup");
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    mode === "signup"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 font-extrabold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Criar Conta</span>
                </button>
              </div>
            )}

            {/* BACK BUTTON FOR FORGOT / RESET */}
            {(mode === "forgot" || mode === "reset") && (
              <div className="flex items-center justify-between mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setMode("login");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-cyan-500/20"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Voltar ao Login</span>
                </button>

                <span className="text-xs font-bold text-slate-300">
                  {mode === "forgot" ? "Recuperar Senha" : "Redefinir Senha"}
                </span>
              </div>
            )}

            {/* MESSAGES */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 font-medium"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{success}</span>
                </motion.div>
              )}

              {/* Sandbox Code Helper */}
              {mode === "reset" && isSandboxSimulation && simulatedToken && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 p-3 rounded-xl bg-cyan-950/70 border border-cyan-400/40 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300 font-mono text-[11px]">CÓDIGO GERADO:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const digits = simulatedToken.split("");
                        setVerificationCode(digits);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-[10px] hover:brightness-110 transition flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Preencher ({simulatedToken})</span>
                    </button>
                  </div>
                  <div className="text-center py-1">
                    <span className="font-mono text-lg font-black tracking-widest text-cyan-300 bg-slate-900/80 px-4 py-1 rounded-lg border border-cyan-400/30 inline-block select-all">
                      {simulatedToken}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ================= MODE 1: LOGIN ================= */}
            {mode === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* 1-CLICK ACCESS BANNER: VIBRANT CYAN & EMERALD */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-emerald-500/15 border border-cyan-400/30 flex items-center justify-between gap-2 shadow-inner">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                      <span className="text-xs font-bold text-white truncate">
                        Eduardo Rocha
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-300/80 truncate block">
                      edu.rocha785@gmail.com
                    </span>
                  </div>

                  <button
                    type="button"
                    id="quick-demo-login-btn"
                    onClick={handleQuickDemoClick}
                    disabled={loading}
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-xs transition cursor-pointer shrink-0 shadow-md shadow-cyan-400/20 flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Entrar 1 Clique</span>
                  </button>
                </div>

                {/* E-mail Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
                    <input
                      type="email"
                      id="login-email-input"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      Senha
                    </label>
                    <button
                      type="button"
                      id="forgot-password-link"
                      onClick={() => {
                        setError("");
                        setSuccess("");
                        setResetEmail(email);
                        setMode("forgot");
                      }}
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="login-password-input"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-12 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
                    <input
                      type="checkbox"
                      checked={rememberEmail}
                      onChange={(e) => setRememberEmail(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400 w-4 h-4 cursor-pointer"
                    />
                    <span>Lembrar e-mail</span>
                  </label>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  id="login-submit-btn"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <span>Entrar no Cofre</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Switch to Signup */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setSuccess("");
                      setMode("signup");
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition cursor-pointer"
                  >
                    Não tem uma conta? <span className="underline text-cyan-400">Criar conta agora</span>
                  </button>
                </div>
              </form>
            )}

            {/* ================= MODE 2: SIGNUP ================= */}
            {mode === "signup" && (
              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Eduardo Rocha"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    CPF
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
                    <input
                      type="text"
                      required
                      value={cpf}
                      onChange={(e) => handleCpfChange(e.target.value)}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Senha
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mín. 6 dígitos"
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-400 outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Confirmar
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a senha"
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-400 outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {password && (
                  <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-slate-400">Segurança:</span>
                      <span className={`font-bold ${passwordStrength.textColor}`}>
                        {passwordStrength.label} ({passwordStrength.score}%)
                      </span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Auto login on signup option */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
                    <input
                      type="checkbox"
                      checked={autoLoginAfterSignup}
                      onChange={(e) => setAutoLoginAfterSignup(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-emerald-400 focus:ring-emerald-400 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-emerald-300 font-medium">Entrar automaticamente no sistema ao concluir</span>
                  </label>
                </div>

                <button
                  type="submit"
                  id="signup-submit-btn"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <span>Criar Conta e Entrar no App</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Option to switch to login */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setSuccess("");
                      setMode("login");
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-bold transition cursor-pointer"
                  >
                    Já tem uma conta? <span className="underline text-emerald-400">Fazer Login</span>
                  </button>
                </div>
              </form>
            )}

            {/* ================= MODE 3: FORGOT PASSWORD ================= */}
            {mode === "forgot" && (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Seu E-mail Cadastrado
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
                    <input
                      type="email"
                      required
                      value={resetEmail || email}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 outline-none transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <span>Enviar Código</span>
                      <Mail className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ================= MODE 4: RESET PASSWORD (PIN + NEW PASSWORD) ================= */}
            {mode === "reset" && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Código de 6 Dígitos</span>
                    </label>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      10 minutos
                    </span>
                  </div>

                  <div className="flex gap-2 justify-between" onPaste={handleCodePaste}>
                    {verificationCode.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { codeInputsRef.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeInputChange(idx, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(idx, e)}
                        className="w-11 sm:w-12 h-12 text-center text-xl font-mono font-black bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 rounded-xl text-cyan-300 outline-none transition"
                      />
                    ))}
                  </div>

                  <div className="flex justify-end items-center mt-2">
                    {codeCountdown > 0 ? (
                      <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Reenviar em {codeCountdown}s</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleForgotPasswordSubmit}
                        className="text-cyan-400 font-bold hover:underline cursor-pointer text-xs"
                      >
                        Reenviar código
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mín. 6 dígitos"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Confirmar
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 outline-none transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || fullCode.length !== 6 || !password || password !== confirmPassword}
                  className="w-full py-3 px-4 bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 hover:brightness-110 disabled:opacity-50 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <span>Redefinir e Entrar</span>
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
