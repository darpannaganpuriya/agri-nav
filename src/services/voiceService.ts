import { mockDelay } from "@/api/client";

const CANNED: { match: RegExp; reply: string }[] = [
  { match: /shelf|kitne din|store kar/i, reply: "Based on your latest analysis, remaining shelf life is 8 days. I recommend cold storage within 24 hours." },
  { match: /price|bhav|mandi|rate/i, reply: "Today's tomato mandi price is ₹22/kg. Forecast shows a rise to ₹25/kg in 10 days." },
  { match: /storage|cold|warehouse/i, reply: "Nearest cold storage is Malwa Cold Chain, 3.2 km away, ₹0.18/kg/day, 120 tons available." },
  { match: /weather|barish|rain/i, reply: "Warm and humid conditions ahead. Move perishables to controlled storage within 24 hours." },
];

export const voiceService = {
  async askAssistant(query: string): Promise<string> {
    const hit = CANNED.find((c) => c.match.test(query));
    const reply = hit?.reply ?? "I can help with shelf life, mandi prices, cold storage, and weather. Try asking about any of these.";
    return mockDelay(reply, 500);
  },
};
