import { mockDelay } from "@/api/client";
import type { AnalysisInput, AnalysisResult, RiskLevel, MarketTrend, CropName } from "@/types";
import { CROPS } from "@/constants/data";

// -----------------------------------------------------------------------------
// MOCK BACKEND
//
// These functions mimic the shape the real FastAPI + ML backend will return.
// To wire the real backend later, replace each function body with an
// apiClient.post(...) call — every consumer (hook, page, component) stays put.
//
// NOTE on the price mock: the real XGBoost model outputs a single value 15 days
// out (no daily granularity). Any per-day price array on the analysis result
// is INTERPOLATED for chart display only, not model output. See marketService.
// -----------------------------------------------------------------------------

const SHELF_LIFE_BASE_DAYS: Record<CropName, number> = {
  Tomato: 10, Potato: 60, Onion: 90, Banana: 8, Mango: 12,
  Cauliflower: 9, Cabbage: 20, Spinach: 5, Grapes: 14, Guava: 10,
  Carrot: 25, Brinjal: 8, Wheat: 180, Rice: 180,
};

function mockSpoilage(crop: CropName, temperature: number, humidity: number, days_stored: number) {
  const base = SHELF_LIFE_BASE_DAYS[crop];
  // rough penalty: hotter + more humid = faster spoilage
  const tempPenalty = Math.max(0, (temperature - 15) * 0.15);
  const humidityPenalty = Math.max(0, (humidity - 70) * 0.02);
  const raw = base * (1 - tempPenalty * 0.05 - humidityPenalty);
  const days_remaining = Math.max(0, Math.round(raw - days_stored));
  const ratio = days_remaining / base;
  const risk_level: RiskLevel = ratio > 0.5 ? "Green" : ratio > 0.2 ? "Yellow" : "Red";
  return { days_remaining, risk_level };
}

function mockPriceForecast(current_price: number, crop: CropName) {
  // Illustrative trend biased by crop; ±5–18% swing over 15 days.
  const bias = (CROPS.find((c) => c.name === crop)?.encoded ?? 5) % 3;
  const factor = bias === 0 ? 1.12 : bias === 1 ? 0.94 : 1.05;
  const price_after_15_days = Math.round(current_price * factor);
  const trend: MarketTrend =
    price_after_15_days > current_price * 1.03 ? "Increasing"
    : price_after_15_days < current_price * 0.97 ? "Decreasing"
    : "Stable";
  return { price_after_15_days, trend };
}

function toQuintalPrice(perKg: number) { return perKg * 100; }

function daysBetween(from: string, to = new Date()) {
  const d = Math.floor((to.getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, d);
}

// In-memory history (resets on reload — a real backend replaces this).
let HISTORY: AnalysisResult[] = [];

export const analysisService = {
  async runAnalysis(input: AnalysisInput): Promise<AnalysisResult> {
    const days_stored = daysBetween(input.harvest_date);
    const spoilage = mockSpoilage(input.crop, input.temperature, input.humidity, days_stored);
    const forecast = mockPriceForecast(input.current_price, input.crop);

    const qtyKg = input.quantity_kg;
    const currentPerKg = input.current_price / 100;
    const futurePerKg = forecast.price_after_15_days / 100;

    // Cost assumptions (illustrative, replace with real economics)
    const storageCostPerKgPerDay = 0.2;
    const transportCostPerKg = 1.5;
    const processingPricePerKg = currentPerKg * 0.85; // processors buy below spot

    const sell_now_revenue = qtyKg * currentPerKg;
    const store_days = Math.min(spoilage.days_remaining, 15);
    const store_revenue = qtyKg * futurePerKg;
    const store_storage_cost = qtyKg * storageCostPerKgPerDay * store_days;
    const process_revenue = qtyKg * processingPricePerKg;

    const profit_options = {
      sell_now: {
        revenue: sell_now_revenue,
        storage_cost: 0,
        transport_cost: qtyKg * transportCostPerKg,
        net_profit: sell_now_revenue - qtyKg * transportCostPerKg,
      },
      store: {
        revenue: store_revenue,
        storage_cost: store_storage_cost,
        transport_cost: qtyKg * transportCostPerKg,
        net_profit: store_revenue - store_storage_cost - qtyKg * transportCostPerKg,
      },
      process: {
        revenue: process_revenue,
        storage_cost: 0,
        transport_cost: qtyKg * transportCostPerKg * 0.7,
        net_profit: process_revenue - qtyKg * transportCostPerKg * 0.7,
      },
    };

    const best = (Object.entries(profit_options) as [keyof typeof profit_options, typeof profit_options.sell_now][])
      .sort((a, b) => b[1].net_profit - a[1].net_profit)[0];

    const actionMap = { sell_now: "Sell Now", store: "Store Crop", process: "Sell to Processing" } as const;
    const action = actionMap[best[0]];
    const durationDays = best[0] === "store" ? store_days : 0;

    // Confidence: bigger profit gap + healthier shelf life = higher confidence
    const gap = Math.abs(best[1].net_profit - profit_options.sell_now.net_profit) / Math.max(1, sell_now_revenue);
    const confidence = Math.min(96, Math.max(62, Math.round(70 + gap * 200 + (spoilage.risk_level === "Green" ? 10 : 0))));

    const reason =
      action === "Store Crop"
        ? `Prices are trending ${forecast.trend.toLowerCase()} and shelf life supports ${durationDays} days of storage.`
        : action === "Sell Now"
          ? `Current mandi price is favorable and holding longer erodes profit through spoilage and storage cost.`
          : `Processing buyers offer stable payout given tight shelf life this week.`;

    const result: AnalysisResult = {
      id: `an_${Date.now()}`,
      crop: input.crop,
      quantity_kg: qtyKg,
      created_at: new Date().toISOString(),
      spoilage,
      price: {
        today: input.current_price,
        after_15_days: forecast.price_after_15_days,
        trend: forecast.trend,
      },
      recommendation: {
        action,
        duration_days: durationDays,
        expected_profit: Math.round(best[1].net_profit),
        confidence,
        reason,
      },
      profit_options,
    };

    HISTORY = [result, ...HISTORY].slice(0, 20);
    return mockDelay(result, 700);
  },

  async getHistory(): Promise<AnalysisResult[]> {
    return mockDelay(HISTORY, 250);
  },

  async getById(id: string): Promise<AnalysisResult | undefined> {
    return mockDelay(HISTORY.find((h) => h.id === id), 200);
  },
};

// Exported for the Market page to build an interpolated visual curve.
// Real model does NOT produce daily granularity — this is illustrative only.
export function interpolateDailyPrices(today: number, day15: number, days = 15) {
  const arr: { day: number; price: number }[] = [];
  for (let i = 0; i <= days; i++) {
    const t = i / days;
    // ease-in-out for a more organic curve
    const eased = t * t * (3 - 2 * t);
    // add a tiny synthetic wobble so it doesn't look perfectly straight
    const wobble = Math.sin(i * 0.9) * (Math.abs(day15 - today) * 0.02);
    arr.push({ day: i, price: Math.round(today + (day15 - today) * eased + wobble) });
  }
  return arr;
}

export { toQuintalPrice };
