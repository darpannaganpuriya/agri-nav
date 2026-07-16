import { apiClient } from "@/api/client";
import type { WeatherReading } from "@/types";

export const weatherService = {
  async getWeather(location: string): Promise<WeatherReading> {
    const response = await apiClient.get(`/api/weather?location=${encodeURIComponent(location)}`);
    return response.data as WeatherReading;
  },
};
