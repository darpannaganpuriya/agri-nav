import { mockDelay } from "@/api/client";
import type { MarketTrend, PricePredictionInput, PricePredictionOutput } from "@/types";
import { CROPS } from "@/constants/data";

function getTrend(current: number, predicted: number): MarketTrend {
  const delta = predicted - current;
  const threshold = current * 0.04;
  if (delta > threshold) return "Increasing";
  if (delta < -threshold) return "Decreasing";
  return "Stable";
}

export const marketPredictionService = {
  async predict(input: PricePredictionInput): Promise<PricePredictionOutput> {
    const cropEntry = CROPS.find((crop) => crop.name === input.crop);
    const baseFactor = cropEntry?.encoded ? 1 + ((cropEntry.encoded % 5) * 0.025) : 1.05;
    const seasonalFactor = 1 + (input.month % 6) * 0.01;
    const weekFactor = 1 + (input.week % 7) * 0.003;
    const predictedPrice = Math.round(input.current_price * baseFactor * seasonalFactor * weekFactor);
    const difference = predictedPrice - input.current_price;
    const trend = getTrend(input.current_price, predictedPrice);
    const confidence = Math.min(96, Math.max(76, Math.round(82 + Math.abs(difference) / 100 + (trend === "Increasing" ? 4 : 0))));

    return mockDelay({
      current_price: input.current_price,
      price_after_15_days: predictedPrice,
      difference,
      trend,
      confidence,
    }, 900);
  },
};
