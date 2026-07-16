import { apiClient } from "@/api/client";
import type { AnalysisInput, AnalysisResult, RiskLevel, MarketTrend, CropName } from "@/types";
import { CROPS } from "@/constants/data";

function daysBetween(from: string, to = new Date()) {
  const d = Math.floor((to.getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, d);
}

function mapToAnalysisResult(input: AnalysisInput, shelfLife: any, price: any): AnalysisResult {
  const qtyKg = input.quantity_kg;
  const currentPerKg = input.current_price / 100;
  const futurePerKg = price.predicted_price / 100;
  const storageCostPerKgPerDay = 0.2;
  const transportCostPerKg = 1.5;
  const processingPricePerKg = currentPerKg * 0.85;

  const sell_now_revenue = qtyKg * currentPerKg;
  const store_days = Math.min(shelfLife.days_remaining, 15);
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

  const best = (Object.entries(profit_options) as [keyof typeof profit_options, typeof profit_options.sell_now][]).sort((a, b) => b[1].net_profit - a[1].net_profit)[0];
  const actionMap = { sell_now: "Sell Now", store: "Store Crop", process: "Sell to Processing" } as const;
  const action = actionMap[best[0]];
  const durationDays = best[0] === "store" ? store_days : 0;
  const gap = Math.abs(best[1].net_profit - profit_options.sell_now.net_profit) / Math.max(1, sell_now_revenue);
  const confidence = Math.min(96, Math.max(62, Math.round(70 + gap * 200 + (shelfLife.risk_level === "Green" ? 10 : 0))));
  const reason = action === "Store Crop" ? `Prices are trending ${price.trend.toLowerCase()} and shelf life supports ${durationDays} days of storage.` : action === "Sell Now" ? `Current mandi price is favorable and holding longer erodes profit through spoilage and storage cost.` : `Processing buyers offer stable payout given tight shelf life this week.`;

  return {
    id: `an_${Date.now()}`,
    crop: input.crop,
    quantity_kg: qtyKg,
    created_at: new Date().toISOString(),
    spoilage: { days_remaining: shelfLife.days_remaining, risk_level: shelfLife.risk_level as RiskLevel },
    price: {
      today: input.current_price,
      after_15_days: price.predicted_price,
      trend: price.trend as MarketTrend,
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
}

let HISTORY: AnalysisResult[] = [];

export const analysisService = {
  async runAnalysis(input: AnalysisInput): Promise<AnalysisResult> {
    const days_stored = daysBetween(input.harvest_date);
    const [shelfLifeRes, priceRes] = await Promise.all([
      apiClient.post("/api/predict/shelf-life", { crop: input.crop, temperature: input.temperature, humidity: input.humidity, days_stored }),
      apiClient.post("/api/predict/price", { crop: input.crop, state: input.state, district: input.district, current_price: input.current_price, month: new Date().getMonth() + 1, week: 1 }),
    ]);
    const result = mapToAnalysisResult(input, shelfLifeRes.data, priceRes.data);
    HISTORY = [result, ...HISTORY].slice(0, 20);
    return result;
  },

  async getHistory(): Promise<AnalysisResult[]> {
    return HISTORY;
  },

  async getById(id: string): Promise<AnalysisResult | undefined> {
    return HISTORY.find((h) => h.id === id);
  },
};

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

function toQuintalPrice(perKg: number) { return perKg * 100; }

export { toQuintalPrice };
