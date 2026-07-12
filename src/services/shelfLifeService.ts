import { mockDelay } from "@/api/client";
import { type CropName, type ShelfLifeInput, type ShelfLifeOutput, type RiskLevel } from "@/types";

const SHELF_LIFE_BASE_DAYS: Record<CropName, number> = {
  Tomato: 10,
  Potato: 60,
  Onion: 90,
  Banana: 8,
  Mango: 12,
  Cauliflower: 9,
  Cabbage: 20,
  Spinach: 5,
  Grapes: 14,
  Guava: 10,
  Carrot: 25,
  Brinjal: 8,
  Wheat: 180,
  Rice: 180,
};

function getRiskLevel(daysRemaining: number, baseDays: number): RiskLevel {
  const ratio = baseDays > 0 ? daysRemaining / baseDays : 0;
  if (ratio > 0.5) return "Green";
  if (ratio > 0.2) return "Yellow";
  return "Red";
}

export const shelfLifeService = {
  async predict(input: ShelfLifeInput): Promise<ShelfLifeOutput> {
    const baseDays = SHELF_LIFE_BASE_DAYS[input.crop] ?? 10;
    const tempPenalty = Math.max(0, input.temperature - 18) * 0.22;
    const humidityPenalty = Math.max(0, input.humidity - 72) * 0.03;
    const adjustedDaysRemaining = Math.max(0, Math.round(baseDays * (1 - tempPenalty * 0.04 - humidityPenalty) - input.days_stored));
    const riskLevel = getRiskLevel(adjustedDaysRemaining, baseDays);
    const confidence = Math.min(96, Math.max(72, Math.round(80 + (baseDays - input.days_stored) * 0.4 - tempPenalty * 5 + (riskLevel === "Green" ? 6 : 0))));
    const recommendation =
      riskLevel === "Green"
        ? `Crop can safely be stored for another ${adjustedDaysRemaining} days.`
        : riskLevel === "Yellow"
          ? `Monitor storage closely; remaining life is limited to ${adjustedDaysRemaining} days.`
          : `Immediate action is recommended; spoilage risk is high within ${adjustedDaysRemaining} days.`;

    return mockDelay({
      days_remaining: adjustedDaysRemaining,
      confidence,
      risk_level: riskLevel,
      recommendation,
    }, 900);
  },
};
