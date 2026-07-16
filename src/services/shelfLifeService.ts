import { apiClient } from "@/api/client";
import { type ShelfLifeInput, type ShelfLifeOutput, type RiskLevel } from "@/types";

export const shelfLifeService = {
  async predict(input: ShelfLifeInput): Promise<ShelfLifeOutput> {
    const response = await apiClient.post("/api/predict/shelf-life", input);
    return {
      days_remaining: response.data.days_remaining,
      confidence: Math.round(response.data.confidence * 100),
      risk_level: response.data.risk_level as RiskLevel,
      recommendation: response.data.recommendation,
    };
  },
};
