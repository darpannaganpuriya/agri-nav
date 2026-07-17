import { apiClient } from "@/api/client";
import { storageService } from "@/services/storageService";
import type { CompleteAnalysisInput, CompleteAnalysisResult, StorageFacility, RiskLevel, MarketTrend } from "@/types";

export const completeAnalysisService = {
  async runAnalysis(input: CompleteAnalysisInput): Promise<CompleteAnalysisResult> {
    // 1. Parallel API calls for Shelf Life and Price Prediction
    const [shelfLifeRes, priceRes] = await Promise.all([
      apiClient.post("/api/predict/shelf-life", {
        crop: input.crop,
        temperature: input.temperature,
        humidity: input.humidity,
        days_stored: input.days_stored,
      }),
      apiClient.post("/api/predict/price", {
        crop: input.crop,
        state: input.state,
        district: input.district,
        current_price: input.current_price,
        month: input.month,
        week: input.week,
      }),
    ]);

    const shelfLife = shelfLifeRes.data;
    const price = priceRes.data;

    // 2. Compute Profit Scenarios
    const qtyKg = input.quantity_kg;
    const currentPerKg = input.current_price / 100; // quintal to kg
    const futurePerKg = price.predicted_price / 100;
    
    // User-provided storage cost per day (default 0.2 ₹/kg if empty)
    const storageCostPerKgPerDay = input.storage_cost ?? 0.2;
    const transportCostPerKg = input.transport_cost;

    const sell_now_revenue = qtyKg * currentPerKg;
    const store_days = Math.min(shelfLife.days_remaining, 15);
    const store_revenue = qtyKg * futurePerKg;
    const store_storage_cost = qtyKg * storageCostPerKgPerDay * store_days;

    const profit_sell_now = sell_now_revenue - (qtyKg * transportCostPerKg);
    const profit_store = store_revenue - store_storage_cost - (qtyKg * transportCostPerKg);

    // 3. Decision Engine
    let action: "Sell Now" | "Store Crop" = "Sell Now";
    let reason = "Current mandi price is favorable and holding longer erodes profit through spoilage and storage cost.";
    
    if (profit_store > profit_sell_now && shelfLife.days_remaining >= store_days) {
      action = "Store Crop";
      reason = `Prices are trending ${price.trend.toLowerCase()} and shelf life supports ${store_days} days of storage, yielding higher expected profit.`;
    }

    // 4. Cold Storage Recommendation
    let recommendedStorage: StorageFacility | undefined = undefined;
    if (action === "Store Crop") {
      try {
        const storages = await storageService.getFacilities({ crop: input.crop });
        if (storages && storages.length > 0) {
          recommendedStorage = storages[0];
        }
      } catch (err) {
        console.error("Failed to fetch cold storage", err);
      }
    }

    // 5. Generate AI Advice (Groq)
    let ai_advice = "Unable to generate AI advice at this time.";
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    
    if (groqKey) {
      try {
        const prompt = `You are an expert agricultural AI assistant in India. 
Based on this data, give a 3-sentence professional advice to a farmer. Be concise, direct, and farmer-friendly.
Crop: ${input.crop}
Shelf Life: ${shelfLife.days_remaining} days left (Risk: ${shelfLife.risk_level})
Today's Price: Rs ${input.current_price}/qtl
Price in 15 days: Rs ${price.predicted_price}/qtl (Trend: ${price.trend})
Recommendation: ${action} for ${action === 'Store Crop' ? store_days : 0} days.
Expected extra profit from storing: Rs ${Math.round(profit_store - profit_sell_now)}`;

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 150
          })
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          ai_advice = groqData.choices[0].message.content;
        }
      } catch (err) {
        console.error("Groq API error", err);
        ai_advice = `Your crop has ${shelfLife.days_remaining} days of shelf life. Prices are expected to be Rs ${price.predicted_price}/qtl. We recommend to ${action.toLowerCase()}.`;
      }
    } else {
      ai_advice = `Your crop has ${shelfLife.days_remaining} days of shelf life. Prices are expected to be Rs ${price.predicted_price}/qtl. We recommend to ${action.toLowerCase()}.`;
    }

    // 6. Return standard result
    return {
      id: `ca_${Date.now()}`,
      crop: input.crop,
      quantity_kg: qtyKg,
      created_at: new Date().toISOString(),
      shelf_life: {
        days_remaining: shelfLife.days_remaining,
        risk_level: shelfLife.risk_level as RiskLevel,
        confidence: Math.round(shelfLife.confidence * 100),
        recommendation: shelfLife.recommendation,
      },
      market: {
        today: input.current_price,
        after_15_days: price.predicted_price,
        trend: price.trend as MarketTrend,
        difference: price.difference,
        confidence: Math.round(price.confidence * 100),
      },
      best_selling: {
        action,
        store_until: action === "Store Crop" ? store_days : 0,
        reason,
      },
      cold_storage: {
        recommended: action === "Store Crop",
        facility: recommendedStorage,
      },
      profit: {
        sell_now: {
          revenue: sell_now_revenue,
          storage_cost: 0,
          transport_cost: qtyKg * transportCostPerKg,
          net_profit: profit_sell_now,
        },
        store: {
          revenue: store_revenue,
          storage_cost: store_storage_cost,
          transport_cost: qtyKg * transportCostPerKg,
          net_profit: profit_store,
        },
      },
      ai_advice,
    };
  }
};
