import { z } from "zod";
import type { FoodItemBreakdown } from "../store/trackingStore";
import { FOOD_DATABASE } from "../data/foodDatabase";

export interface OracleAnalysisResult {
  headline: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  items: FoodItemBreakdown[];
  guruCommentary: string;
  poweredBy: "google_gemini" | "offline_nlp";
  /** Clauses the engine could not recognise; surfaced as "Add it manually" (never guessed). */
  unmatched: string[];
}

const geminiItemSchema = z.object({
  name: z.string(),
  portion: z.string().default("1 serving"),
  cal: z.number().nonnegative(),
  p: z.number().nonnegative(),
  c: z.number().nonnegative(),
  f: z.number().nonnegative(),
});
const geminiResultSchema = z.object({
  headline: z.string().optional(),
  guruCommentary: z.string().optional(),
  items: z.array(geminiItemSchema).default([]),
});
const geminiEnvelopeSchema = z.object({
  candidates: z.array(z.object({ content: z.object({ parts: z.array(z.object({ text: z.string().optional() })) }) })).optional(),
});



function parsePortionCount(clause: string, keyword: string): number {
  const c = clause.toLowerCase();
  const digitMatch = c.match(/(\d+(?:\.\d+)?)\s*(?:cups?|pieces?|pcs?|slices?|scoops?|tbsp|grams?|g|oz)?/);
  if (digitMatch && digitMatch[1]) {
    const val = parseFloat(digitMatch[1]);
    if (!isNaN(val) && val > 0 && val <= 30) return val;
    if (val > 30) return +(val / 100).toFixed(1);
  }
  if (c.includes("half") || c.includes("1/2")) return 0.5;
  if (c.includes("two") || c.includes("double")) return 2;
  if (c.includes("three") || c.includes("triple")) return 3;
  if (c.includes("four")) return 4;
  return 1;
}

export async function askOracleAiFoodGuru(
  userPrompt: string,
  userProvidedApiKey?: string
): Promise<OracleAnalysisResult> {
  const query = userPrompt.trim();
  const geminiKey = (
    userProvidedApiKey ||
    process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
    ""
  ).trim();

  // 1. CALL GOOGLE GEMINI 3.5 FLASH-LITE / 3.8 FLASH API
  if (geminiKey) {
    try {
      const models = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-3.5-flash"];
      for (const model of models) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        const systemPrompt = `You are Oracle, the high-performance AI Sports Nutritionist for GetPhysical.
Parse the athlete's conversational meal log into exact macronutrients (calories, protein, carbs, fat).
Return ONLY a valid JSON object matching this schema:
{
  "headline": "Short clean meal title",
  "totalCalories": number,
  "totalProtein": number,
  "totalCarbs": number,
  "totalFat": number,
  "items": [{"name": string, "portion": string, "cal": number, "p": number, "c": number, "f": number}],
  "guruCommentary": "1-2 sentences of athletic nutritional insight"
}`;

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\nMeal logged: "${query}"` }] }],
            generationConfig: {
              response_mime_type: "application/json",
              temperature: 0.2,
            },
          }),
        });

        if (response.ok) {
          const envelope = geminiEnvelopeSchema.safeParse(await response.json());
          const rawText = envelope.success ? envelope.data.candidates?.[0]?.content.parts[0]?.text : undefined;
          const parsed = rawText ? geminiResultSchema.safeParse(JSON.parse(rawText.trim())) : null;
          if (parsed?.success && parsed.data.items.length > 0) {
            const items: FoodItemBreakdown[] = parsed.data.items;
            return {
              headline: parsed.data.headline || query.slice(0, 30),
              totalCalories: Math.round(items.reduce((sum, i) => sum + i.cal, 0)),
              totalProtein: Math.round(items.reduce((sum, i) => sum + i.p, 0)),
              totalCarbs: Math.round(items.reduce((sum, i) => sum + i.c, 0)),
              totalFat: Math.round(items.reduce((sum, i) => sum + i.f, 0)),
              items,
              guruCommentary: parsed.data.guruCommentary || "Logged via Google Gemini nutrition engine.",
              poweredBy: "google_gemini",
              unmatched: [],
            };
          }
        }
      }
    } catch (err) {
      console.warn("Google Gemini API error, falling back to local NLP engine:", err);
    }
  }

  // 2. INTELLIGENT MULTI-ITEM LOCAL NLP ENGINE
  const clauses = query
    .split(/,|\band\b|&|\+|\n|with/i)
    .map((s) => s.trim())
    .filter(Boolean);

  const matchedItems: FoodItemBreakdown[] = [];
  const processedRules = new Set<string>();
  const unmatched: string[] = [];

  for (const clause of clauses) {
    let clauseMatched = false;
    for (const food of FOOD_DATABASE) {
      const matchWord = food.keywords.find((kw) => clause.toLowerCase().includes(kw));
      if (matchWord && !processedRules.has(food.baseName)) {
        processedRules.add(food.baseName);
        const count = parsePortionCount(clause, matchWord);
        matchedItems.push({
          name: food.baseName,
          portion: count === 1 ? food.defaultPortion : `${count}x ${food.defaultPortion}`,
          cal: Math.round(food.cal * count),
          p: Math.round(food.p * count * 10) / 10,
          c: Math.round(food.c * count * 10) / 10,
          f: Math.round(food.f * count * 10) / 10,
        });
        clauseMatched = true;
        break;
      }
    }

    if (!clauseMatched && clause.length > 2) unmatched.push(clause);
  }

  const totalCal = matchedItems.reduce((acc, i) => acc + i.cal, 0);
  const totalP = matchedItems.reduce((acc, i) => acc + i.p, 0);
  const totalC = matchedItems.reduce((acc, i) => acc + i.c, 0);
  const totalF = matchedItems.reduce((acc, i) => acc + i.f, 0);

  const proteinPct = Math.round(((totalP * 4) / Math.max(1, totalCal)) * 100);

  return {
    headline: matchedItems.length === 1 ? (matchedItems[0]?.name ?? query) : `${matchedItems[0]?.name ?? query} + ${matchedItems.length - 1} items`,
    totalCalories: totalCal,
    totalProtein: Math.round(totalP),
    totalCarbs: Math.round(totalC),
    totalFat: Math.round(totalF),
    items: matchedItems,
    guruCommentary: `${totalP}g protein (${proteinPct}% of calories). Optimal fuel for muscle protein synthesis and recovery.`,
    poweredBy: "offline_nlp",
    unmatched,
  };
}
