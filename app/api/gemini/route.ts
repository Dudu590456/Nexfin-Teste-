import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Gemini client with proper telemetry headers as per system guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, dataContext, message, history } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        error: "GEMINI_API_KEY is not configured. Please add it to your secrets panel.",
      }, { status: 500 });
    }

    // Context summary for the AI
    const financeSummary = JSON.stringify(dataContext || {});

    if (type === "radar") {
      // Automatic smart radar generator
      const prompt = `Based on the following user financial database, analyze and generate critical smart alerts.
      Provide the response STRICTLY as a JSON array of alerts matching this TypeScript interface:
      interface SmartAlert {
        id: string;
        type: "danger" | "warning" | "info" | "success";
        title: string;
        description: string;
        category: string;
        potentialSavings?: string;
      }
      Do not include any markdown formatting, code blocks or backticks. Return raw JSON.

      Financial Data Context:
      ${financeSummary}

      Generate 3 to 5 realistic and actionable alerts based on these transactions, goals, installments, and bills.
      If there is not much data, create simulated smart insights that fit a real person's typical budget, using the existing categories. Use Portuguese.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, description: "Must be 'danger', 'warning', 'info' or 'success'" },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                category: { type: Type.STRING },
                potentialSavings: { type: Type.STRING },
              },
              required: ["id", "type", "title", "description", "category"],
            },
          },
        },
      });

      return NextResponse.json({ data: JSON.parse(response.text || "[]") });
    }

    if (type === "loss") {
      // "Onde estou perdendo dinheiro" analysis
      const prompt = `Based on the following user financial database, analyze where they are losing money or spending unnecessarily.
      Identify potential wastes, excessive categories, redundant subscriptions, and provide personalized daily tips.
      Provide the response STRICTLY as a JSON object matching this TypeScript interface:
      interface LossAnalysis {
        scoreImpact: number; // Out of 100
        wastes: Array<{ category: string; amount: number; description: string }>;
        redundantSubscriptions: Array<{ name: string; amount: number; usage: string }>;
        possibleSavingsTotal: number;
        tips: string[]; // List of 3 actionable tips in Portuguese
      }
      Do not include any markdown formatting, code blocks or backticks. Return raw JSON.

      Financial Data Context:
      ${financeSummary}

      Use Portuguese.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scoreImpact: { type: Type.INTEGER },
              wastes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    description: { type: Type.STRING },
                  },
                  required: ["category", "amount", "description"],
                },
              },
              redundantSubscriptions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    usage: { type: Type.STRING },
                  },
                  required: ["name", "amount", "usage"],
                },
              },
              possibleSavingsTotal: { type: Type.NUMBER },
              tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["scoreImpact", "wastes", "redundantSubscriptions", "possibleSavingsTotal", "tips"],
          },
        },
      });

      return NextResponse.json({ data: JSON.parse(response.text || "{}") });
    }

    // Default chat interaction
    const chatHistory = history || [];
    const formattedHistory = chatHistory.map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }],
    }));

    // Inject financial context in a system instruction
    const systemInstruction = `Você é o NexFin AI, um assistente financeiro de elite integrado à plataforma NexFin.
    Você tem acesso em tempo real aos dados financeiros do usuário. Use esta informação para dar respostas extremamente precisas, personalizadas e realistas.
    Seja elegante, direto e aja como um consultor premium (Wealth Advisor).
    Não invente dados fictícios se existirem dados reais no contexto, mas se os dados estiverem vazios, incentive o usuário a adicionar transações, metas ou cartões.
    Fale sempre em Português do Brasil.

    DADOS FINANCEIROS ATUAIS DO USUÁRIO:
    ${financeSummary}

    Questões que você responde com precisão:
    - Onde estou perdendo dinheiro?
    - Quanto posso economizar?
    - Como melhorar meu Score?
    - Qual conta devo pagar primeiro?
    - Quanto posso gastar hoje?
    - Posso comprar determinado produto?
    - Como estão meus investimentos?`;

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
      },
      history: formattedHistory,
    });

    const response = await chat.sendMessage({ message: message });
    return NextResponse.json({ text: response.text });

  } catch (error: any) {
    console.error("Gemini Route Error:", error);
    return NextResponse.json({ error: error.message || "Unknown error occurred" }, { status: 500 });
  }
}
