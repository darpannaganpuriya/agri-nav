import { mockDelay } from "@/api/client";
import type { WeatherReading } from "@/types";

export const weatherService = {
  async getWeather(location: string): Promise<WeatherReading> {
    return mockDelay({
      location,
      temperature: 32,
      humidity: 68,
      rain_next_48h_mm: 4,
      heatwave_risk: "Moderate",
      spoilage_alert: "Yellow",
      forecast_summary: "Warm and humid — perishables should be moved to controlled storage within 24 hours.",
    }, 350);
  },
};
