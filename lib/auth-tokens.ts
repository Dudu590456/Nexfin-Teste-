// Memory store for verification codes with TTL and rate limiting
export interface ResetTokenEntry {
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
}

// Global store across hot reloads in Node.js
declare global {
  var __nexfin_reset_tokens__: Map<string, ResetTokenEntry> | undefined;
}

const resetTokens: Map<string, ResetTokenEntry> =
  global.__nexfin_reset_tokens__ || new Map<string, ResetTokenEntry>();

if (process.env.NODE_ENV !== "production") {
  global.__nexfin_reset_tokens__ = resetTokens;
}

export const AuthTokenManager = {
  saveCode(email: string, code: string, ttlMinutes = 10): ResetTokenEntry {
    const cleanEmail = email.toLowerCase().trim();
    const entry: ResetTokenEntry = {
      email: cleanEmail,
      code,
      expiresAt: Date.now() + ttlMinutes * 60 * 1000,
      attempts: 0,
    };
    resetTokens.set(cleanEmail, entry);
    return entry;
  },

  verifyCode(email: string, code: string): { valid: boolean; error?: string } {
    const cleanEmail = email.toLowerCase().trim();
    const entry = resetTokens.get(cleanEmail);

    if (!entry) {
      return { 
        valid: false, 
        error: "Nenhum código de recuperação ativo para este e-mail ou o código expirou. Solicite um novo código." 
      };
    }

    if (Date.now() > entry.expiresAt) {
      resetTokens.delete(cleanEmail);
      return { 
        valid: false, 
        error: "O código de recuperação de 6 dígitos expirou (limite de 10 minutos). Solicite um novo código." 
      };
    }

    if (entry.attempts >= 5) {
      resetTokens.delete(cleanEmail);
      return { 
        valid: false, 
        error: "Número excessivo de tentativas incorretas. Por motivos de segurança, solicite um novo código." 
      };
    }

    if (entry.code !== code.trim()) {
      entry.attempts += 1;
      return { 
        valid: false, 
        error: `Código incorreto. Você tem ${5 - entry.attempts} tentativa(s) restante(s).` 
      };
    }

    return { valid: true };
  },

  consumeCode(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    resetTokens.delete(cleanEmail);
  },

  getCode(email: string): string | null {
    const cleanEmail = email.toLowerCase().trim();
    const entry = resetTokens.get(cleanEmail);
    if (!entry || Date.now() > entry.expiresAt) return null;
    return entry.code;
  }
};
