import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Texto vazio ou inválido." }, { status: 400 });
    }

    // If GEMINI_API_KEY is available, use Gemini model
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const prompt = `Analise a seguinte frase falada ou digitada por um usuário sobre uma despesa ou receita financeira em Português do Brasil:
"${text}"

Extraia os seguintes dados:
- type: "income" (se for salário, ganho, rendimento, recebimento, pix recebido, venda) ou "expense" (se for gasto, compra, pagamento, conta, despesa)
- amount: número em reais (ex: 45.50)
- description: descrição curta e limpa da transação (ex: "Almoço", "Combustível Posto", "Salário Mensal")
- category: categoria financeira apropriada (ex: "Alimentação", "Transporte", "Moradia", "Lazer", "Saúde", "Educação", "Salário", "Serviços", "Investimentos", "Outros")
- paymentMethod: método de pagamento se mencionado ("credit", "debit", "pix", "cash", "boleto") ou "pix" por padrão
- notes: a frase original do usuário

Retorne estritamente um JSON.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ["income", "expense"] },
                amount: { type: Type.NUMBER },
                description: { type: Type.STRING },
                category: { type: Type.STRING },
                paymentMethod: { type: Type.STRING, enum: ["credit", "debit", "pix", "cash", "boleto"] },
                notes: { type: Type.STRING },
              },
              required: ["type", "amount", "description", "category"],
            },
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        if (parsed && parsed.amount) {
          return NextResponse.json({
            success: true,
            transaction: {
              type: parsed.type || "expense",
              amount: Number(parsed.amount),
              description: parsed.description || "Lançamento",
              category: parsed.category || "Geral",
              paymentMethod: parsed.paymentMethod || "pix",
              notes: parsed.notes || text,
            }
          });
        }
      } catch (geminiError) {
        console.warn("Gemini parse failed, falling back to heuristics:", geminiError);
      }
    }

    // Heuristic Fallback
    const lower = text.toLowerCase();
    const isIncome = /recebi|ganhei|sal[aá]rio|rendimento|vendi|pix recebido|dep[oó]sito/i.test(lower);
    const amountMatch = lower.match(/(\d+(?:[.,]\d{1,2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(",", ".")) : 50;

    let category = "Geral";
    if (/almo[cç]o|jantar|lanche|comida|mercado|restaurante|pizza|caf[eé]/i.test(lower)) category = "Alimentação";
    else if (/gasolina|combust[ií]vel|uber|t[aá]xi|estacionamento|passagem|transporte/i.test(lower)) category = "Transporte";
    else if (/luz|energia|[aá]gua|aluguel|internet|condom[ií]nio/i.test(lower)) category = "Moradia";
    else if (/rem[eé]dio|farm[aá]cia|m[eé]dico|consulta|hospital/i.test(lower)) category = "Saúde";
    else if (/cinema|viagem|festa|bar|jogo|show|livro/i.test(lower)) category = "Lazer";
    else if (isIncome) category = "Salário";

    let paymentMethod = "pix";
    if (/cr[eé]dito|cart[aã]o de cr[eé]dito/i.test(lower)) paymentMethod = "credit";
    else if (/d[eé]bito|cart[aã]o de d[eé]bito/i.test(lower)) paymentMethod = "debit";
    else if (/boleto|c[oó]digo de barra/i.test(lower)) paymentMethod = "boleto";
    else if (/dinheiro|esp[eé]cie/i.test(lower)) paymentMethod = "cash";

    let description = isIncome ? "Recebimento Rápido" : "Gasto Rápido";
    if (/almo[cç]o/i.test(lower)) description = "Almoço";
    else if (/mercado/i.test(lower)) description = "Compras de Mercado";
    else if (/gasolina/i.test(lower)) description = "Gasolina / Abastecimento";
    else if (/farm[aá]cia/i.test(lower)) description = "Farmácia / Medicamentos";
    else if (/sal[aá]rio/i.test(lower)) description = "Salário Mensal";
    else if (/luz/i.test(lower)) description = "Conta de Luz";

    return NextResponse.json({
      success: true,
      transaction: {
        type: isIncome ? "income" : "expense",
        amount,
        description,
        category,
        paymentMethod,
        notes: text,
      }
    });

  } catch (err: any) {
    console.error("Parse voice error:", err);
    return NextResponse.json({ error: err.message || "Erro ao interpretar áudio." }, { status: 500 });
  }
}
