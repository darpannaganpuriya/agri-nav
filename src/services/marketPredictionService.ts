import { apiClient } from "@/api/client";
import type { MarketTrend, PricePredictionInput, PricePredictionOutput } from "@/types";

export const marketPredictionService = {
  async predict(input: PricePredictionInput): Promise<PricePredictionOutput> {
    const response = await apiClient.post("/api/predict/price", input);
    return {
      current_price: response.data.current_price,
      price_after_15_days: response.data.predicted_price,
      difference: response.data.difference,
      trend: response.data.trend as MarketTrend,
      confidence: Math.round(response.data.confidence * 100),
    };
  },
};
