import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/serverStore";
import { getDb, markDbUnhealthy } from "@/lib/db";
import { 
  userProfiles,
  transactions,
  goals,
  budgets,
  investments,
  notifications,
  calendarEvents,
  cards,
  installments,
  financialScores,
  aiHistoryItems,
  financialReports
} from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Authenticate with ServerStore (central shared persistent authority)
    const storeAuth = ServerStore.authenticateUser(cleanEmail, password);

    if (!storeAuth.success || !storeAuth.user) {
      return NextResponse.json(
        { error: storeAuth.error || "E-mail ou senha incorretos." },
        { status: storeAuth.status || 401 }
      );
    }

    const authenticatedUser = storeAuth.user;
    let userData = storeAuth.data;

    // 2. Best-effort pull from PostgreSQL if available and healthy to merge any cloud changes
    try {
      const db = getDb();
      if (db) {
        const [
          txList,
          goalList,
          budgetList,
          investList,
          notifList,
          eventList,
          cardList,
          instalList,
          scoreList,
          aiHistList,
          reportList
        ] = await Promise.all([
          db.select().from(transactions).where(eq(transactions.userId, authenticatedUser.id)),
          db.select().from(goals).where(eq(goals.userId, authenticatedUser.id)),
          db.select().from(budgets).where(eq(budgets.userId, authenticatedUser.id)),
          db.select().from(investments).where(eq(investments.userId, authenticatedUser.id)),
          db.select().from(notifications).where(eq(notifications.userId, authenticatedUser.id)),
          db.select().from(calendarEvents).where(eq(calendarEvents.userId, authenticatedUser.id)),
          db.select().from(cards).where(eq(cards.userId, authenticatedUser.id)),
          db.select().from(installments).where(eq(installments.userId, authenticatedUser.id)),
          db.select().from(financialScores).where(eq(financialScores.userId, authenticatedUser.id)).limit(1),
          db.select().from(aiHistoryItems).where(eq(aiHistoryItems.userId, authenticatedUser.id)),
          db.select().from(financialReports).where(eq(financialReports.userId, authenticatedUser.id)),
        ]);

        // If PostgreSQL has more recent items, merge them into userData
        if (txList.length > 0 || goalList.length > 0 || budgetList.length > 0) {
          userData = {
            ...userData,
            transactions: txList.length > 0 ? txList : userData?.transactions,
            goals: goalList.length > 0 ? goalList : userData?.goals,
            budgets: budgetList.length > 0 ? budgetList : userData?.budgets,
            investments: investList.length > 0 ? investList : userData?.investments,
            notifications: notifList.length > 0 ? notifList : userData?.notifications,
            calendarEvents: eventList.length > 0 ? eventList : userData?.calendarEvents,
            cards: cardList.length > 0 ? cardList : userData?.cards,
            installments: instalList.length > 0 ? instalList : userData?.installments,
            score: scoreList[0] || userData?.score,
            aiHistory: aiHistList.length > 0 ? aiHistList : userData?.aiHistory,
            financialReports: reportList.length > 0 ? reportList : userData?.financialReports,
          };
          ServerStore.saveUserData(authenticatedUser.id, userData as any);
        }
      }
    } catch (pgErr) {
      console.warn("[Login] PostgreSQL sync skipped (using server vault data):", (pgErr as any)?.message || pgErr);
      markDbUnhealthy();
    }

    return NextResponse.json({
      success: true,
      message: "Acesso autorizado!",
      user: {
        id: authenticatedUser.id,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        cpf: authenticatedUser.cpf,
        avatar: authenticatedUser.avatar,
        theme: authenticatedUser.theme || "dark",
        language: authenticatedUser.language || "pt",
        preferences: authenticatedUser.preferences || {
          notificationsEnabled: true,
          aiGrounding: true,
          realtimeSync: true,
        },
      },
      data: userData,
    });
  } catch (error: any) {
    console.error("Error in POST /api/auth/login:", error);
    return NextResponse.json(
      {
        error: error.message || "Erro interno ao processar login.",
      },
      { status: 500 }
    );
  }
}
export async function GET(req: NextRequest) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
