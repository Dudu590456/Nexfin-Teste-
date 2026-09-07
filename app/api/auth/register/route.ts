import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { id, name, email, cpf, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        localOnly: true,
        message: "Offline mode. Registering locally."
      });
    }

    const db = getDb();
    
    // Ensure column password exists dynamically
    try {
      await db.execute(sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS password TEXT;`);
    } catch (err) {
      console.error("Error creating password column dynamically:", err);
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already exists on the server
    const existing = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.email, cleanEmail))
      .limit(1);

    if (existing.length > 0) {
      const existingUser = existing[0];
      // Update password & details and allow direct login
      try {
        await db.execute(sql`UPDATE user_profiles SET password = ${password}, name = COALESCE(NULLIF(${name}, ''), name), cpf = COALESCE(NULLIF(${cpf}, ''), cpf) WHERE id = ${existingUser.id};`);
      } catch (updErr) {
        console.warn("Could not update existing user details:", updErr);
      }

      const updatedUser = {
        id: existingUser.id,
        name: name || existingUser.name || "Usuário",
        email: cleanEmail,
        cpf: cpf || existingUser.cpf || "",
        avatar: existingUser.avatar || `https://picsum.photos/seed/${(name || "user").split(" ")[0].toLowerCase()}/150/150`,
        theme: existingUser.theme || "dark",
        language: existingUser.language || "pt",
      };

      return NextResponse.json({
        success: true,
        user: updatedUser,
        userId: existingUser.id,
        alreadyExists: true,
        message: "Conta localizada e sincronizada com sucesso!"
      });
    }

    const userId = id || "user-" + Date.now();

    // Insert user profile with password
    await db.insert(userProfiles).values({
      id: userId,
      name: name || "",
      email: cleanEmail,
      cpf: cpf || "",
      avatar: `https://picsum.photos/seed/${(name || "user").split(" ")[0].toLowerCase()}/150/150`,
      theme: "dark",
      language: "pt",
      notificationsEnabled: true,
      aiGrounding: true,
      realtimeSync: true,
      password: password,
    });

    const newUser = {
      id: userId,
      name: name || "Usuário",
      email: cleanEmail,
      cpf: cpf || "",
      avatar: `https://picsum.photos/seed/${(name || "user").split(" ")[0].toLowerCase()}/150/150`,
      theme: "dark",
      language: "pt",
    };

    return NextResponse.json({
      success: true,
      user: newUser,
      userId,
      message: "Usuário cadastrado com sucesso no servidor."
    });
  } catch (error: any) {
    console.error("Error in POST /api/auth/register:", error);
    return NextResponse.json({
      success: false,
      error: "Falha ao registrar usuário no servidor.",
      details: error.message || String(error)
    }, { status: 500 });
  }
}
