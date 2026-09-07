import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
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
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Check if database URL is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        synchronized: false,
        message: "Supabase DATABASE_URL is not configured. Running in offline fallback mode.",
      });
    }

    const db = getDb();

    // Pull all data for the user from Supabase PostgreSQL tables in parallel
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
      db.select().from(userProfiles).where(eq(userProfiles.id, userId)).limit(1),
      db.select().from(transactions).where(eq(transactions.userId, userId)),
      db.select().from(goals).where(eq(goals.userId, userId)),
      db.select().from(budgets).where(eq(budgets.userId, userId)),
      db.select().from(investments).where(eq(investments.userId, userId)),
      db.select().from(attachments).where(eq(attachments.userId, userId)),
      db.select().from(notifications).where(eq(notifications.userId, userId)),
      db.select().from(calendarEvents).where(eq(calendarEvents.userId, userId)),
      db.select().from(cards).where(eq(cards.userId, userId)),
      db.select().from(installments).where(eq(installments.userId, userId)),
      db.select().from(financialReports).where(eq(financialReports.userId, userId)),
      db.select().from(financialScores).where(eq(financialScores.userId, userId)).limit(1),
      db.select().from(aiHistoryItems).where(eq(aiHistoryItems.userId, userId)),
    ]);

    return NextResponse.json({
      success: true,
      synchronized: true,
      data: {
        profile: profileResult[0] || null,
        transactions: transactionsResult,
        goals: goalsResult,
        budgets: budgetsResult,
        investments: investmentsResult,
        attachments: attachmentsResult,
        notifications: notificationsResult,
        calendarEvents: calendarEventsResult,
        cards: cardsResult,
        installments: installmentsResult,
        financialReports: financialReportsResult,
        score: financialScoresResult[0] || null,
        aiHistory: aiHistoryResult,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/sync:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to pull synchronized data.",
      details: error.message || String(error),
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, data } = body;

    if (!userId || !data) {
      return NextResponse.json({ error: "userId and data are required" }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        synchronized: false,
        message: "Supabase DATABASE_URL is not configured. Saved locally.",
      });
    }

    const db = getDb();

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

    // Since we are doing a full synchronization of collections, we can safely overwrite or merge.
    // For simplicity and complete synchronization accuracy between multiple devices (offline-first sync):
    // Delete existing records for this user and insert the new state. This guarantees PC and mobile have exactly the same records.
    
    // Perform deletions & insertions in transactions
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

    // Perform deletions & insertions in goals
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

    // Perform deletions & insertions in budgets
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

    // Perform deletions & insertions in investments
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

    // Perform deletions & insertions in cards
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

    // Perform deletions & insertions in installments
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

    // Perform deletions & insertions in notifications
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

    // Perform deletions & insertions in calendarEvents
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

    // Upsert Score
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

    // Perform deletions & insertions in AI History
    if (data.aiHistory) {
      await db.delete(aiHistoryItems).where(eq(aiHistoryItems.userId, userId));
      if (data.aiHistory.length > 0) {
        // Keep only last 20 messages for prompt performance
        const recentHistory = data.aiHistory.slice(-20);
        await db.insert(aiHistoryItems).values(recentHistory.map((h: any) => ({
          id: h.id || `ah-${Math.random().toString(36).substring(2, 9)}`,
          userId: userId,
          role: h.role,
          content: h.content,
          timestamp: h.timestamp || new Date().toISOString(),
        })));
      }
    }

    // Perform deletions & insertions in Financial Reports
    if (data.financialReports) {
      await db.delete(financialReports).where(eq(financialReports.userId, userId));
      if (data.financialReports.length > 0) {
        await db.insert(financialReports).values(data.financialReports.map((rep: any) => ({
          id: rep.id,
          userId: userId,
          type: rep.type,
          title: rep.title,
          fileUrl: rep.fileUrl || "",
          generatedAt: rep.generatedAt || new Date().toISOString(),
        })));
      }
    }

    return NextResponse.json({
      success: true,
      synchronized: true,
      message: "Data successfully synced to Supabase PostgreSQL database.",
    });
  } catch (error: any) {
    console.error("Error in POST /api/sync:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to push synchronization.",
      details: error.message || String(error),
    }, { status: 500 });
  }
}
