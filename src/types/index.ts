// Data shapes match the real FastAPI + trained ML models (see README/build prompt).
// crop is a string label on the wire (backend label-encodes internally).

export type CropName =
  | "Tomato" | "Potato" | "Onion" | "Banana" | "Mango"
  | "Cauliflower" | "Cabbage" | "Spinach" | "Grapes" | "Guava"
  | "Carrot" | "Brinjal" | "Wheat" | "Rice";

export type RiskLevel = "Green" | "Yellow" | "Red";
export type MarketTrend = "Increasing" | "Stable" | "Decreasing";

// ---- Model 1: Spoilage / shelf-life ----
export interface SpoilageInput {
  crop: CropName;
  temperature: number; // °C, 0–45
  humidity: number;    // %, 40–100
  days_stored: number; // 0–30
}
export interface SpoilageOutput {
  days_remaining: number;
  risk_level: RiskLevel;
}

// ---- Model 2: XGBoost mandi price forecast ----
export interface PriceInput {
  crop: CropName;
  state: string;
  district: string;
  current_price: number; // ₹/quintal
  month: number;         // 1–12
  week: number;          // 1–52
}
export interface PriceOutput {
  price_after_15_days: number; // ₹/quintal
}

// ---- Composite: full analysis (what the /analyze endpoint returns) ----
export interface AnalysisInput {
  crop: CropName;
  quantity_kg: number;
  harvest_date: string; // ISO
  state: string;
  district: string;
  current_price: number; // ₹/quintal
  temperature: number;
  humidity: number;
}

export interface AnalysisResult {
  id: string;
  crop: CropName;
  quantity_kg: number;
  created_at: string;
  spoilage: SpoilageOutput;
  price: {
    today: number;               // ₹/quintal
    after_15_days: number;       // ₹/quintal
    trend: MarketTrend;
  };
  recommendation: {
    action: "Sell Now" | "Store Crop" | "Sell to Processing";
    duration_days: number;       // 0 if sell-now
    expected_profit: number;     // ₹
    confidence: number;          // 0–100
    reason: string;
  };
  profit_options: {
    sell_now: ProfitBreakdown;
    store:    ProfitBreakdown;
    process:  ProfitBreakdown;
  };
}
export interface ProfitBreakdown {
  revenue: number;
  storage_cost: number;
  transport_cost: number;
  net_profit: number;
}

// ---- Cold storage ----
export interface StorageFacility {
  id: string;
  name: string;
  distance_km: number;
  capacity_tons: number;
  available_tons: number;
  cost_per_kg_day: number;
  compatible_crops: CropName[];
  rating: number;
  lat: number;
  lng: number;
  image: string;
  address: string;
  amenities: string[];
}
export interface BookingInput {
  facility_id: string;
  crop: CropName;
  quantity_kg: number;
  duration_days: number;
}
export interface Booking extends BookingInput {
  id: string;
  status: "Pending" | "Confirmed" | "Rejected";
  created_at: string;
  facility_name: string;
  estimated_cost: number;
}

// ---- Weather ----
export interface WeatherReading {
  location: string;
  temperature: number;
  humidity: number;
  rain_next_48h_mm: number;
  heatwave_risk: "Low" | "Moderate" | "High";
  spoilage_alert: RiskLevel;
  forecast_summary: string;
}

// ---- Schemes ----
export interface Scheme {
  id: string;
  name: string;
  short_name?: string;
  category: "Subsidy" | "Insurance" | "Infrastructure" | "Market";
  eligibility: string;
  description: string;
  benefits: string[];
  link: string;
  crops?: CropName[];
}
