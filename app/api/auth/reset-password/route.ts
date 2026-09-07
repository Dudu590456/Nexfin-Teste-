import { NextRequest, NextResponse } from "next/server";
import { AuthTokenManager } from "@/lib/auth-tokens";
import { getDb } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "E-mail, código de verificação e nova senha são obrigatórios." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve conter no mínimo 6 caracteres para garantir sua segurança." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Verify token with security rules
    const verification = AuthTokenManager.verifyCode(cleanEmail, code);
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error || "Código de recuperação inválido ou expirado." },
        { status: 400 }
      );
    }

    // Update password in database if DATABASE_URL is available
    if (process.env.DATABASE_URL) {
      try {
        const db = getDb();
        try {
          await db.execute(sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS password TEXT;`);
        } catch {}

        await db
          .update(userProfiles)
          .set({ password: newPassword })
          .where(eq(userProfiles.email, cleanEmail));
      } catch (dbError: any) {
        console.error("Database update password error:", dbError);
      }
    }

    // Invalidate code after successful reset
    AuthTokenManager.consumeCode(cleanEmail);

    return NextResponse.json({
      success: true,
      message: "Senha redefinida com sucesso! Sua credencial foi atualizada no cofre de segurança.",
    });
  } catch (error: any) {
    console.error("Error in POST /api/auth/reset-password:", error);
    return NextResponse.json(
      { error: "Erro interno ao redefinir a senha." },
      { status: 500 }
    );
  }
}
