import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/serverStore";
import { getDb, markDbUnhealthy } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { id, name, email, cpf, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve conter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = (name || "").trim() || cleanEmail.split("@")[0] || "Usuário";
    const cleanCpf = (cpf || "").trim();

    // 1. Register or update immediately in ServerStore (persistent server-side shared vault)
    const storeResult = ServerStore.registerUser({
      id,
      name: cleanName,
      email: cleanEmail,
      cpf: cleanCpf,
      password,
    });

    if (!storeResult.success || !storeResult.user) {
      return NextResponse.json(
        { error: storeResult.error || "Erro ao salvar cadastro no servidor." },
        { status: 400 }
      );
    }

    const savedUser = storeResult.user;

    // 2. Best-effort async synchronization to PostgreSQL if configured
    try {
      const db = getDb();
      if (db) {
        // Ensure column password exists dynamically
        await db.execute(sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS password TEXT;`).catch(() => {});

        const existing = await db
          .select()
          .from(userProfiles)
          .where(eq(userProfiles.email, cleanEmail))
          .limit(1);

        if (existing.length > 0) {
          await db.execute(
            sql`UPDATE user_profiles SET password = ${password}, name = COALESCE(NULLIF(${cleanName}, ''), name), cpf = COALESCE(NULLIF(${cleanCpf}, ''), cpf) WHERE id = ${existing[0].id};`
          );
        } else {
          await db.insert(userProfiles).values({
            id: savedUser.id,
            name: cleanName,
            email: cleanEmail,
            cpf: cleanCpf,
            avatar: savedUser.avatar,
            theme: "dark",
            language: "pt",
            notificationsEnabled: true,
            aiGrounding: true,
            realtimeSync: true,
            password: password,
          });
        }
      }
    } catch (pgErr) {
      console.warn("[Register] PostgreSQL sync skipped (using server vault):", (pgErr as any)?.message || pgErr);
      markDbUnhealthy();
    }

    return NextResponse.json({
      success: true,
      user: savedUser,
      userId: savedUser.id,
      alreadyExists: storeResult.alreadyExists ?? false,
      message: storeResult.alreadyExists
        ? "Conta localizada e sincronizada com sucesso!"
        : "Cadastro realizado com sucesso! Pronto para acesso em qualquer aparelho.",
    });
  } catch (error: any) {
    console.error("Error in POST /api/auth/register:", error);
    return NextResponse.json(
      {
        error: error.message || "Erro inesperado ao registrar usuário.",
      },
      { status: 500 }
    );
  }
}
