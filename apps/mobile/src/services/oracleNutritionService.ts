import type { FoodItemBreakdown } from "../store/trackingStore";
import { getSessionUserId, getSupabase } from "../lib/supabase";

export interface OracleAnalysisResult {
  headline: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  items: FoodItemBreakdown[];
  guruCommentary: string;
  poweredBy: "google_gemini" | "offline_nlp";
}

interface KnownFoodRule {
  keywords: string[];
  baseName: string;
  defaultPortion: string;
  cal: number;
  p: number;
  c: number;
  f: number;
}

const FOOD_DATABASE: KnownFoodRule[] = [
  // Proteins & Eggs
  { keywords: ["egg", "eggs", "scrambled egg", "boiled egg", "fried egg"], baseName: "Whole Egg", defaultPortion: "1 large (50g)", cal: 72, p: 6.3, c: 0.4, f: 4.8 },
  { keywords: ["egg white", "egg whites"], baseName: "Liquid Egg Whites", defaultPortion: "100g (approx 3 whites)", cal: 52, p: 11, c: 0.7, f: 0.2 },
  { keywords: ["chicken breast", "chicken breasts", "grilled chicken"], baseName: "Grilled Chicken Breast", defaultPortion: "100g cooked", cal: 165, p: 31, c: 0, f: 3.6 },
  { keywords: ["chicken thigh", "chicken leg"], baseName: "Roasted Chicken Thigh", defaultPortion: "1 thigh (110g)", cal: 210, p: 26, c: 0, f: 11 },
  { keywords: ["ground beef", "beef mince"], baseName: "Lean Ground Beef (90/10)", defaultPortion: "100g cooked", cal: 215, p: 26, c: 0, f: 12 },
  { keywords: ["steak", "beef steak", "sirloin", "ribeye"], baseName: "Grass-Fed Beef Steak", defaultPortion: "150g grilled", cal: 290, p: 38, c: 0, f: 14 },
  { keywords: ["salmon", "salmon fillet"], baseName: "Atlantic Salmon Fillet", defaultPortion: "150g baked", cal: 310, p: 34, c: 0, f: 18 },
  { keywords: ["tuna", "canned tuna"], baseName: "Chunk Light Tuna in Water", defaultPortion: "1 can drained (120g)", cal: 130, p: 29, c: 0, f: 1 },
  { keywords: ["whey", "protein powder", "whey isolate", "protein shake"], baseName: "Whey Protein Isolate", defaultPortion: "1 scoop (32g)", cal: 120, p: 25, c: 2, f: 1 },
  { keywords: ["tofu", "firm tofu"], baseName: "Firm Organic Tofu", defaultPortion: "100g", cal: 83, p: 10, c: 2, f: 5 },

  // Carbohydrates & Grains
  { keywords: ["white rice", "jasmine rice", "steamed rice", "rice"], baseName: "Steamed Jasmine Rice", defaultPortion: "1 cup cooked (158g)", cal: 206, p: 4.3, c: 45, f: 0.4 },
  { keywords: ["brown rice"], baseName: "Steamed Brown Rice", defaultPortion: "1 cup cooked (195g)", cal: 216, p: 5, c: 45, f: 1.8 },
  { keywords: ["garlic rice", "sinangag"], baseName: "Filipino Garlic Fried Rice", defaultPortion: "1 cup (160g)", cal: 240, p: 4.5, c: 46, f: 4.5 },
  { keywords: ["bread", "toast", "sourdough", "whole wheat bread"], baseName: "Toasted Bread", defaultPortion: "1 slice (38g)", cal: 95, p: 3.5, c: 18, f: 1.2 },
  { keywords: ["bagel"], baseName: "Plain Bakery Bagel", defaultPortion: "1 whole (100g)", cal: 275, p: 11, c: 53, f: 1.7 },
  { keywords: ["oat", "oats", "oatmeal", "rolled oats"], baseName: "Rolled Whole Oats", defaultPortion: "1/2 cup dry (40g)", cal: 150, p: 5, c: 27, f: 2.5 },
  { keywords: ["sweet potato", "kamote"], baseName: "Baked Sweet Potato", defaultPortion: "1 medium (130g)", cal: 112, p: 2, c: 26, f: 0.1 },
  { keywords: ["potato", "boiled potato", "mashed potato"], baseName: "Baked Idaho Potato", defaultPortion: "1 medium (173g)", cal: 161, p: 4.3, c: 37, f: 0.2 },
  { keywords: ["pasta", "spaghetti", "penne"], baseName: "Cooked Semolina Pasta", defaultPortion: "1 cup (140g)", cal: 220, p: 8, c: 43, f: 1.3 },

  // Healthy Fats & Dairy
  { keywords: ["avocado"], baseName: "Fresh Hass Avocado", defaultPortion: "1/2 avocado (100g)", cal: 160, p: 2, c: 8.5, f: 14.7 },
  { keywords: ["peanut butter"], baseName: "Natural Peanut Butter", defaultPortion: "2 tbsp (32g)", cal: 188, p: 8, c: 7, f: 16 },
  { keywords: ["almond", "almonds"], baseName: "Whole Roasted Almonds", defaultPortion: "1 oz / 23 nuts (28g)", cal: 164, p: 6, c: 6, f: 14 },
  { keywords: ["olive oil", "oil"], baseName: "Extra Virgin Olive Oil", defaultPortion: "1 tbsp (14g)", cal: 119, p: 0, c: 0, f: 13.5 },
  { keywords: ["butter"], baseName: "Dairy Butter", defaultPortion: "1 tbsp (14g)", cal: 102, p: 0.1, c: 0, f: 11.5 },
  { keywords: ["greek yogurt", "yogurt"], baseName: "Plain Greek Yogurt 0%", defaultPortion: "1 cup (170g)", cal: 100, p: 17, c: 6, f: 0.7 },
  { keywords: ["cheese", "cheddar"], baseName: "Cheddar Cheese Slice", defaultPortion: "1 slice (28g)", cal: 113, p: 7, c: 0.4, f: 9.3 },

  // Fruits & Vegetables
  { keywords: ["banana", "bananas"], baseName: "Fresh Yellow Banana", defaultPortion: "1 medium (118g)", cal: 105, p: 1.3, c: 27, f: 0.3 },
  { keywords: ["apple", "apples"], baseName: "Crisp Red Apple", defaultPortion: "1 medium (182g)", cal: 95, p: 0.5, c: 25, f: 0.3 },
  { keywords: ["blueberry", "blueberries", "berries"], baseName: "Fresh Blueberries", defaultPortion: "1 cup (148g)", cal: 84, p: 1.1, c: 21, f: 0.5 },
  { keywords: ["broccoli"], baseName: "Steamed Fresh Broccoli", defaultPortion: "1 cup florets (91g)", cal: 31, p: 2.6, c: 6, f: 0.3 },
  { keywords: ["spinach"], baseName: "Baby Spinach Leaves", defaultPortion: "2 cups raw (60g)", cal: 14, p: 1.8, c: 2.2, f: 0.2 },

  // Drinks & Cafe
  { keywords: ["latte", "flat white", "cappuccino"], baseName: "Café Latte (Whole Milk)", defaultPortion: "1 cup (350ml)", cal: 170, p: 9, c: 14, f: 9 },
  { keywords: ["black coffee", "americano", "espresso"], baseName: "Espresso / Americano", defaultPortion: "1 cup", cal: 5, p: 0.5, c: 0, f: 0 },
  { keywords: ["whole milk", "milk"], baseName: "Fresh Whole Milk", defaultPortion: "1 cup (240ml)", cal: 149, p: 7.7, c: 11.7, f: 8 },
  { keywords: ["almond milk"], baseName: "Unsweetened Almond Milk", defaultPortion: "1 cup (240ml)", cal: 30, p: 1, c: 1, f: 2.5 },
  { keywords: ["orange juice"], baseName: "100% Orange Juice", defaultPortion: "1 glass (240ml)", cal: 112, p: 1.7, c: 26, f: 0.5 },

  // Dishes & Popular Meals
  { keywords: ["adobo", "chicken adobo", "pork adobo"], baseName: "Filipino Style Adobo", defaultPortion: "1 cup bowl (220g)", cal: 380, p: 36, c: 8, f: 22 },
  { keywords: ["sinigang"], baseName: "Pork & Veg Sinigang", defaultPortion: "1 bowl with soup", cal: 320, p: 28, c: 12, f: 18 },
  { keywords: ["inasal", "chicken inasal"], baseName: "Grilled Chicken Inasal Quarter", defaultPortion: "1 leg quarter (180g)", cal: 290, p: 34, c: 2, f: 16 },
  { keywords: ["pizza", "pepperoni pizza"], baseName: "Pepperoni Pizza Slice", defaultPortion: "1 slice (107g)", cal: 298, p: 12, c: 32, f: 13 },
  { keywords: ["burger", "cheeseburger"], baseName: "Classic Beef Cheeseburger", defaultPortion: "1 burger (180g)", cal: 535, p: 30, c: 40, f: 28 },
  { keywords: ["french fries", "fries"], baseName: "Golden French Fries", defaultPortion: "1 medium (117g)", cal: 365, p: 4, c: 48, f: 17 },
];

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

/**
 * Server-side AI parse via the `nutrition-parse` edge function (the Gemini key
 * never ships in the app). Returns null when signed out, offline, rate-limited
 * or on any upstream error, so the caller can use the on-device parser.
 */
async function parseWithServer(query: string): Promise<OracleAnalysisResult | null> {
  const supabase = getSupabase();
  if (!supabase || !(await getSessionUserId())) return null;
  try {
    const { data, error } = await supabase.functions.invoke<OracleAnalysisResult>("nutrition-parse", {
      body: { meal: query },
    });
    if (error || !data) return null;
    return { ...data, items: data.items.slice(0, 20) };
  } catch {
    return null;
  }
}

export async function askOracleAiFoodGuru(userPrompt: string): Promise<OracleAnalysisResult> {
  const query = userPrompt.trim();

  // 1. SERVER-SIDE AI (authenticated, quota-limited)
  const serverResult = await parseWithServer(query);
  if (serverResult) return serverResult;

  // 2. INTELLIGENT MULTI-ITEM LOCAL NLP ENGINE
  const clauses = query
    .split(/,|\band\b|&|\+|\n|with/i)
    .map((s) => s.trim())
    .filter(Boolean);

  const matchedItems: FoodItemBreakdown[] = [];
  const processedRules = new Set<string>();

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

    if (!clauseMatched && clause.length > 2) {
      matchedItems.push({
        name: clause.slice(0, 28),
        portion: "1 standard serving",
        cal: 220,
        p: 12,
        c: 24,
        f: 8,
      });
    }
  }

  if (matchedItems.length === 0) {
    matchedItems.push({
      name: query.slice(0, 32),
      portion: "1 athletic portion",
      cal: 380,
      p: 28,
      c: 35,
      f: 12,
    });
  }

  const totalCal = matchedItems.reduce((acc, i) => acc + i.cal, 0);
  const totalP = matchedItems.reduce((acc, i) => acc + i.p, 0);
  const totalC = matchedItems.reduce((acc, i) => acc + i.c, 0);
  const totalF = matchedItems.reduce((acc, i) => acc + i.f, 0);

  const proteinPct = Math.round(((totalP * 4) / Math.max(1, totalCal)) * 100);

  return {
    headline: matchedItems.length === 1 ? matchedItems[0]!.name : `${matchedItems[0]!.name} + ${matchedItems.length - 1} items`,
    totalCalories: totalCal,
    totalProtein: Math.round(totalP),
    totalCarbs: Math.round(totalC),
    totalFat: Math.round(totalF),
    items: matchedItems,
    guruCommentary: `${totalP}g protein (${proteinPct}% of calories). Optimal fuel for muscle protein synthesis and recovery.`,
    poweredBy: "offline_nlp",
  };
}
