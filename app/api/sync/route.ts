import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { ServerStore } from "@/lib/serverStore";
import { getDb, ensureDatabaseSchema, markDbUnhealthy } from "@/lib/db";
import {
  userProfiles,
  transactions,
  goals,
  budgets,
  investments,
  attachments,
  notifications,
  calendarEvents,
  cards,
  installments,
  financialReports,
  financialScores,
  aiHistoryItems,
} from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const checkStatus = url.searchParams.get("check");

    if (checkStatus === "status") {
      return NextResponse.json({
        configured: true,
        hasUrl: Boolean(process.env.DATABASE_URL),
        mode: "server-vault",
      });
    }

    const userId = url.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // 1. Fetch data from ServerStore (always available and persistent across devices)
    let storeData = ServerStore.getUserData(userId) || {
      profile: ServerStore.findUserById(userId) || undefined,
      transactions: [],
      goals: [],
      budgets: [],
      investments: [],
      cards: [],
      installments: [],
      notifications: [],
      calendarEvents: [],
      score: null,
      aiHistory: [],
      financialReports: [],
      notes: [],
      checklists: [],
    };

    // 2. Best-effort pull from PostgreSQL if available
    try {
      const db = getDb();
      if (db) {
        await ensureDatabaseSchema().catch(() => false);

        const safeQuery = async <T>(query: Promise<T>, fallback: T): Promise<T> => {
          try {
            return await query;
          } catch {
            return fallback;
          }
        };

        const [
          profileResult,
          transactionsResult,
          goalsResult,
          budgetsResult,
          investmentsResult,
          attachmentsResult,
          notificationsResult,
          calendarEventsResult,
          cardsResult,
          installmentsResult,
          financialReportsResult,
          financialScoresResult,
          aiHistoryResult,
        ] = await Promise.all([
          safeQuery(db.select().from(userProfiles).where(eq(userProfiles.id, userId)).limit(1), []),
          safeQuery(db.select().from(transactions).where(eq(transactions.userId, userId)), []),
          safeQuery(db.select().from(goals).where(eq(goals.userId, userId)), []),
          safeQuery(db.select().from(budgets).where(eq(budgets.userId, userId)), []),
          safeQuery(db.select().from(investments).where(eq(investments.userId, userId)), []),
          safeQuery(db.select().from(attachments).where(eq(attachments.userId, userId)), []),
          safeQuery(db.select().from(notifications).where(eq(notifications.userId, userId)), []),
          safeQuery(db.select().from(calendarEvents).where(eq(calendarEvents.userId, userId)), []),
          safeQuery(db.select().from(cards).where(eq(cards.userId, userId)), []),
          safeQuery(db.select().from(installments).where(eq(installments.userId, userId)), []),
          safeQuery(db.select().from(financialReports).where(eq(financialReports.userId, userId)), []),
          safeQuery(db.select().from(financialScores).where(eq(financialScores.userId, userId)).limit(1), []),
          safeQuery(db.select().from(aiHistoryItems).where(eq(aiHistoryItems.userId, userId)), []),
        ]);

        if (transactionsResult.length > 0 || goalsResult.length > 0 || budgetsResult.length > 0) {
          storeData = {
            ...storeData,
            profile: profileResult[0] || storeData.profile,
            transactions: transactionsResult.length > 0 ? transactionsResult : storeData.transactions,
            goals: goalsResult.length > 0 ? goalsResult : storeData.goals,
            budgets: budgetsResult.length > 0 ? budgetsResult : storeData.budgets,
            investments: investmentsResult.length > 0 ? investmentsResult : storeData.investments,
            attachments: attachmentsResult.length > 0 ? attachmentsResult : (storeData as any).attachments,
            notifications: notificationsResult.length > 0 ? notificationsResult : storeData.notifications,
            calendarEvents: calendarEventsResult.length > 0 ? calendarEventsResult : storeData.calendarEvents,
            cards: cardsResult.length > 0 ? cardsResult : storeData.cards,
            installments: installmentsResult.length > 0 ? installmentsResult : storeData.installments,
            financialReports: financialReportsResult.length > 0 ? financialReportsResult : storeData.financialReports,
            score: financialScoresResult[0] || storeData.score,
            aiHistory: aiHistoryResult.length > 0 ? aiHistoryResult : storeData.aiHistory,
          };
          ServerStore.saveUserData(userId, storeData as any);
        }
      }
    } catch (pgErr) {
      markDbUnhealthy();
    }

    return NextResponse.json({
      success: true,
      synchronized: true,
      data: storeData,
    });
  } catch (error: any) {
    console.error("Error in GET /api/sync:", error);
    return NextResponse.json({
      success: true,
      synchronized: true,
      data: ServerStore.getUserData(new URL(req.url).searchParams.get("userId") || ""),
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, data } = body;

    if (!userId || !data) {
      return NextResponse.json({ error: "userId and data are required" }, { status: 400 });
    }

    // 1. Immediately save to persistent ServerStore for instant cross-device availability
    ServerStore.saveUserData(userId, data);

    // 2. Best-effort async push to PostgreSQL if available
    try {
      const db = getDb();
      if (db) {
        // Upsert Profile
        if (data.profile) {
          const p = data.profile;
          await db.insert(userProfiles).values({
            id: userId,
            name: p.name || "",
            email: p.email || "",
            cpf: p.cpf || "",
            avatar: p.avatar || "",
            theme: p.theme || "dark",
            language: p.language || "pt",
            notificationsEnabled: p.preferences?.notificationsEnabled ?? true,
            aiGrounding: p.preferences?.aiGrounding ?? true,
            realtimeSync: p.preferences?.realtimeSync ?? true,
          }).onConflictDoUpdate({
            target: userProfiles.id,
            set: {
              name: p.name || "",
              email: p.email || "",
              cpf: p.cpf || "",
              avatar: p.avatar || "",
              theme: p.theme || "dark",
              language: p.language || "pt",
              notificationsEnabled: p.preferences?.notificationsEnabled ?? true,
              aiGrounding: p.preferences?.aiGrounding ?? true,
              realtimeSync: p.preferences?.realtimeSync ?? true,
            }
          });
        }

        // Transactions
        if (data.transactions) {
          await db.delete(transactions).where(eq(transactions.userId, userId));
          if (data.transactions.length > 0) {
            await db.insert(transactions).values(data.transactions.map((t: any) => ({
              id: t.id,
              userId: userId,
              type: t.type,
              category: t.category,
              amount: Number(t.amount),
              description: t.description || "",
              date: t.date,
              cardId: t.cardId || null,
              status: t.status || "paid",
            })));
          }
        }

        // Goals
        if (data.goals) {
          await db.delete(goals).where(eq(goals.userId, userId));
          if (data.goals.length > 0) {
            await db.insert(goals).values(data.goals.map((g: any) => ({
              id: g.id,
              userId: userId,
              name: g.name,
              targetAmount: Number(g.targetAmount),
              currentAmount: Number(g.currentAmount),
              category: g.category,
              deadline: g.deadline,
            })));
          }
        }

        // Budgets
        if (data.budgets) {
          await db.delete(budgets).where(eq(budgets.userId, userId));
          if (data.budgets.length > 0) {
            await db.insert(budgets).values(data.budgets.map((b: any) => ({
              id: b.id,
              userId: userId,
              category: b.category,
              limitAmount: Number(b.limitAmount),
              spentAmount: Number(b.spentAmount),
              month: b.month,
            })));
          }
        }

        // Investments
        if (data.investments) {
          await db.delete(investments).where(eq(investments.userId, userId));
          if (data.investments.length > 0) {
            await db.insert(investments).values(data.investments.map((i: any) => ({
              id: i.id,
              userId: userId,
              name: i.name,
              category: i.category,
              amount: Number(i.amount),
              yieldRate: i.yieldRate,
              date: i.date,
            })));
          }
        }

        // Cards
        if (data.cards) {
          await db.delete(cards).where(eq(cards.userId, userId));
          if (data.cards.length > 0) {
            await db.insert(cards).values(data.cards.map((c: any) => ({
              id: c.id,
              userId: userId,
              name: c.name,
              limit: Number(c.limit),
              currentSpent: Number(c.currentSpent),
              color: c.color,
              expiry: c.expiry,
              lastFour: c.lastFour,
            })));
          }
        }

        // Installments
        if (data.installments) {
          await db.delete(installments).where(eq(installments.userId, userId));
          if (data.installments.length > 0) {
            await db.insert(installments).values(data.installments.map((ins: any) => ({
              id: ins.id,
              userId: userId,
              description: ins.description,
              totalAmount: Number(ins.totalAmount),
              installmentsCount: Number(ins.installmentsCount),
              installmentAmount: Number(ins.installmentAmount),
              currentInstallment: Number(ins.currentInstallment),
              category: ins.category,
              firstDueDate: ins.firstDueDate,
            })));
          }
        }

        // Notifications
        if (data.notifications) {
          await db.delete(notifications).where(eq(notifications.userId, userId));
          if (data.notifications.length > 0) {
            await db.insert(notifications).values(data.notifications.map((n: any) => ({
              id: n.id,
              userId: userId,
              type: n.type,
              title: n.title,
              message: n.message,
              date: n.date,
              read: n.read ?? false,
            })));
          }
        }

        // Calendar Events
        if (data.calendarEvents) {
          await db.delete(calendarEvents).where(eq(calendarEvents.userId, userId));
          if (data.calendarEvents.length > 0) {
            await db.insert(calendarEvents).values(data.calendarEvents.map((ce: any) => ({
              id: ce.id,
              userId: userId,
              title: ce.title,
              amount: Number(ce.amount),
              type: ce.type,
              date: ce.date,
              status: ce.status,
              isRecurring: ce.isRecurring ?? false,
            })));
          }
        }

        // Score
        if (data.score) {
          const s = data.score;
          await db.insert(financialScores).values({
            id: `s-${userId}`,
            userId: userId,
            score: s.score,
            organization: s.details?.organization ?? 100,
            control: s.details?.control ?? 100,
            savings: s.details?.savings ?? 100,
            reserve: s.details?.reserve ?? 100,
            goals: s.details?.goals ?? 100,
            punctuality: s.details?.punctuality ?? 100,
            suggestions: s.suggestions || [],
          }).onConflictDoUpdate({
            target: financialScores.id,
            set: {
              score: s.score,
              organization: s.details?.organization ?? 100,
              control: s.details?.control ?? 100,
              savings: s.details?.savings ?? 100,
              reserve: s.details?.reserve ?? 100,
              goals: s.details?.goals ?? 100,
              punctuality: s.details?.punctuality ?? 100,
              suggestions: s.suggestions || [],
            }
          });
        }
      }
    } catch (pgErr) {
      markDbUnhealthy();
    }

    return NextResponse.json({
      success: true,
      synchronized: true,
      message: "Dados sincronizados com sucesso no cofre compartilhado.",
    });
  } catch (error: any) {
    console.error("Error in POST /api/sync:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Erro ao sincronizar dados.",
    }, { status: 500 });
  }
}
