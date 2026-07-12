import { mockDelay } from "@/api/client";
import type { StorageFacility, Booking, BookingInput, CropName } from "@/types";
import coldStorageImg from "@/assets/cold-storage.jpg";

const ALL_CROPS: CropName[] = ["Tomato","Potato","Onion","Banana","Mango","Cauliflower","Cabbage","Spinach","Grapes","Guava","Carrot","Brinjal","Wheat","Rice"];

const FACILITIES: StorageFacility[] = [
  {
    id: "cs_1", name: "Malwa Cold Chain", distance_km: 3.2,
    capacity_tons: 500, available_tons: 120, cost_per_kg_day: 0.18,
    compatible_crops: ["Tomato","Potato","Onion","Cauliflower","Cabbage","Carrot","Brinjal"],
    rating: 4.7, lat: 22.7196, lng: 75.8577, image: coldStorageImg,
    address: "Sector 4, Sanwer Road, Indore, MP",
    amenities: ["24/7 backup", "Pre-cooling", "Reefer loading bay", "CCTV"],
  },
  {
    id: "cs_2", name: "Krishi Bhandar", distance_km: 6.8,
    capacity_tons: 300, available_tons: 45, cost_per_kg_day: 0.22,
    compatible_crops: ["Grapes","Mango","Guava","Banana"],
    rating: 4.4, lat: 22.7532, lng: 75.8937, image: coldStorageImg,
    address: "Rau, Indore, MP",
    amenities: ["Humidity control", "Ripening chamber", "Fumigation"],
  },
  {
    id: "cs_3", name: "GreenChain Warehouse", distance_km: 11.4,
    capacity_tons: 800, available_tons: 320, cost_per_kg_day: 0.15,
    compatible_crops: ALL_CROPS,
    rating: 4.9, lat: 22.6800, lng: 75.9100, image: coldStorageImg,
    address: "Mhow-Neemuch Highway, Indore, MP",
    amenities: ["Solar backup", "Multi-zone", "24/7 backup", "Insurance included"],
  },
  {
    id: "cs_4", name: "Annapurna Storage", distance_km: 14.9,
    capacity_tons: 400, available_tons: 0, cost_per_kg_day: 0.20,
    compatible_crops: ["Wheat","Rice","Onion","Potato"],
    rating: 4.1, lat: 22.6500, lng: 75.7800, image: coldStorageImg,
    address: "Khandwa Road, Indore, MP",
    amenities: ["Grain silos", "Weigh bridge"],
  },
];

let BOOKINGS: Booking[] = [];

export const storageService = {
  async getFacilities(filters?: { crop?: CropName; maxDistance?: number }): Promise<StorageFacility[]> {
    let list = [...FACILITIES];
    if (filters?.crop) list = list.filter((f) => f.compatible_crops.includes(filters.crop!));
    if (filters?.maxDistance) list = list.filter((f) => f.distance_km <= filters.maxDistance!);
    return mockDelay(list.sort((a, b) => a.distance_km - b.distance_km), 400);
  },
  async bookStorage(input: BookingInput): Promise<Booking> {
    const f = FACILITIES.find((x) => x.id === input.facility_id)!;
    const booking: Booking = {
      ...input,
      id: `bk_${Date.now()}`,
      status: "Confirmed",
      created_at: new Date().toISOString(),
      facility_name: f.name,
      estimated_cost: Math.round(input.quantity_kg * f.cost_per_kg_day * input.duration_days),
    };
    BOOKINGS = [booking, ...BOOKINGS];
    return mockDelay(booking, 700);
  },
  async getBookings() { return mockDelay(BOOKINGS, 200); },
};
