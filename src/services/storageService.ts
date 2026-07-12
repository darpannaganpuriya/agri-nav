import { mockDelay } from "@/api/client";
import type { StorageFacility, Booking, BookingInput, CropName } from "@/types";
import coldStorageImg from "@/assets/cold-storage.jpg";

const ALL_CROPS: CropName[] = ["Tomato","Potato","Onion","Banana","Mango","Cauliflower","Cabbage","Spinach","Grapes","Guava","Carrot","Brinjal","Wheat","Rice"];

const INITIAL_FACILITIES: StorageFacility[] = [
  {
    id: "cs_1", owner_id: "owner_demo", name: "Malwa Cold Chain", distance_km: 3.2,
    capacity_tons: 500, available_tons: 120, occupied_tons: 380, cost_per_kg_day: 0.18,
    compatible_crops: ["Tomato","Potato","Onion","Cauliflower","Cabbage","Carrot","Brinjal"],
    rating: 4.7, lat: 22.7196, lng: 75.8577, image: coldStorageImg,
    address: "Sector 4, Sanwer Road, Indore, MP", amenities: ["24/7 backup", "Pre-cooling", "Reefer loading bay", "CCTV"],
    verification_status: "Verified", status: "Active", temperature_range: "8°C - 14°C", humidity_range: "70% - 85%", facilities: ["Generator", "CCTV", "Loading Dock"],
  },
  {
    id: "cs_2", owner_id: "owner_demo_2", name: "Krishi Bhandar", distance_km: 6.8,
    capacity_tons: 300, available_tons: 45, occupied_tons: 255, cost_per_kg_day: 0.22,
    compatible_crops: ["Grapes","Mango","Guava","Banana"],
    rating: 4.4, lat: 22.7532, lng: 75.8937, image: coldStorageImg,
    address: "Rau, Indore, MP", amenities: ["Humidity control", "Ripening chamber", "Fumigation"],
    verification_status: "Verified", status: "Active", temperature_range: "10°C - 18°C", humidity_range: "80% - 90%", facilities: ["Solar Backup", "Parking"],
  },
  {
    id: "cs_3", owner_id: "owner_demo_3", name: "GreenChain Warehouse", distance_km: 11.4,
    capacity_tons: 800, available_tons: 320, occupied_tons: 480, cost_per_kg_day: 0.15,
    compatible_crops: ALL_CROPS,
    rating: 4.9, lat: 22.6800, lng: 75.9100, image: coldStorageImg,
    address: "Mhow-Neemuch Highway, Indore, MP", amenities: ["Solar backup", "Multi-zone", "24/7 backup", "Insurance included"],
    verification_status: "Verified", status: "Active", temperature_range: "4°C - 12°C", humidity_range: "65% - 80%", facilities: ["Generator", "Solar Backup", "Insurance"],
  },
  {
    id: "cs_4", owner_id: "owner_demo_4", name: "Annapurna Storage", distance_km: 14.9,
    capacity_tons: 400, available_tons: 0, occupied_tons: 400, cost_per_kg_day: 0.20,
    compatible_crops: ["Wheat","Rice","Onion","Potato"],
    rating: 4.1, lat: 22.6500, lng: 75.7800, image: coldStorageImg,
    address: "Khandwa Road, Indore, MP", amenities: ["Grain silos", "Weigh bridge"],
    verification_status: "Pending", status: "Paused", temperature_range: "12°C - 20°C", humidity_range: "50% - 70%", facilities: ["Forklift"],
  },
];

let FACILITIES: StorageFacility[] = [...INITIAL_FACILITIES];
let BOOKINGS: Booking[] = [];

export const storageService = {
  async registerStorage(input: Omit<StorageFacility, "id" | "distance_km" | "capacity_tons" | "available_tons" | "rating" | "image" | "amenities" | "verification_status" | "status"> & { image?: string; distance_km?: number; capacity_tons?: number; available_tons?: number; rating?: number; amenities?: string[]; verification_status?: string; status?: "Active" | "Paused" }): Promise<StorageFacility> {
    const totalCapacityTons = Math.max(50, Math.round((input.total_capacity_kg ?? 0) / 1000));
    const availableCapacityTons = Math.max(0, Math.round((input.available_capacity_kg ?? input.total_capacity_kg ?? 0) / 1000));
    const occupiedCapacityTons = Math.max(0, totalCapacityTons - availableCapacityTons);
    const facility: StorageFacility = {
      id: `cs_${Date.now()}`,
      owner_id: input.owner_id,
      name: input.name,
      storage_type: input.storage_type,
      owner_name: input.owner_name,
      phone: input.phone,
      email: input.email,
      address: input.address,
      state: input.state,
      district: input.district,
      pincode: input.pincode,
      lat: input.lat ?? 22.7196,
      lng: input.lng ?? 75.8577,
      distance_km: input.distance_km ?? 4.5,
      capacity_tons: totalCapacityTons,
      available_tons: availableCapacityTons,
      occupied_tons: occupiedCapacityTons,
      cost_per_kg_day: input.cost_per_kg_day ?? 0.2,
      cost_per_crate_day: input.cost_per_crate_day,
      compatible_crops: input.compatible_crops ?? [],
      rating: input.rating ?? 4.5,
      image: input.image ?? coldStorageImg,
      amenities: input.amenities ?? ["24/7 Security", "Power Backup"],
      verification_status: input.verification_status ?? "Pending",
      status: input.status ?? "Active",
      temperature_range: input.temperature_range,
      humidity_range: input.humidity_range,
      facilities: input.facilities,
      total_capacity_kg: input.total_capacity_kg,
      occupied_capacity_kg: input.occupied_capacity_kg,
      available_capacity_kg: input.available_capacity_kg,
      max_daily_intake_kg: input.max_daily_intake_kg,
      max_capacity_per_booking_kg: input.max_capacity_per_booking_kg,
      storage_chambers: input.storage_chambers,
      min_booking_days: input.min_booking_days,
      max_booking_days: input.max_booking_days,
      loading_charges: input.loading_charges,
      unloading_charges: input.unloading_charges,
      packaging_charges: input.packaging_charges,
      security_deposit: input.security_deposit,
      gst_included: input.gst_included,
      min_temperature: input.min_temperature,
      max_temperature: input.max_temperature,
      cooling_technology: input.cooling_technology,
      working_hours: input.working_hours,
      power_backup: input.power_backup,
      generator: input.generator,
      solar_backup: input.solar_backup,
      insurance_available: input.insurance_available,
      security_24x7: input.security_24x7,
      cctv: input.cctv,
      digital_weighing_machine: input.digital_weighing_machine,
      forklift: input.forklift,
      loading_dock: input.loading_dock,
      parking: input.parking,
      images: input.images,
    };
    FACILITIES = [facility, ...FACILITIES];
    return mockDelay(facility, 500);
  },
  async getAllStorages(): Promise<StorageFacility[]> {
    return mockDelay([...FACILITIES].sort((a, b) => a.distance_km - b.distance_km), 400);
  },
  async getStorageByOwner(ownerId?: string): Promise<StorageFacility[]> {
    const id = ownerId ?? "";
    return mockDelay(FACILITIES.filter((facility) => facility.owner_id === id), 300);
  },
  async getFacilities(filters?: { crop?: CropName; maxDistance?: number }): Promise<StorageFacility[]> {
    let list = [...FACILITIES];
    if (filters?.crop) list = list.filter((f) => f.compatible_crops.includes(filters.crop!));
    if (filters?.maxDistance) list = list.filter((f) => f.distance_km <= filters.maxDistance!);
    return mockDelay(list.sort((a, b) => a.distance_km - b.distance_km), 400);
  },
  async updateStorage(id: string, updates: Partial<StorageFacility>): Promise<StorageFacility | undefined> {
    FACILITIES = FACILITIES.map((facility) => facility.id === id ? { ...facility, ...updates } : facility);
    return mockDelay(FACILITIES.find((facility) => facility.id === id), 400);
  },
  async deleteStorage(id: string): Promise<boolean> {
    const before = FACILITIES.length;
    FACILITIES = FACILITIES.filter((facility) => facility.id !== id);
    return mockDelay(before !== FACILITIES.length, 300);
  },
  async updateAvailability(id: string, availableTons: number): Promise<StorageFacility | undefined> {
    return this.updateStorage(id, { available_tons: availableTons, occupied_tons: Math.max(0, Math.round((FACILITIES.find((f) => f.id === id)?.capacity_tons ?? 0) - availableTons)) });
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
  async getBookings(ownerId?: string) {
    const list = ownerId ? BOOKINGS.filter((booking) => booking.facility_id === ownerId) : BOOKINGS;
    return mockDelay(list, 200);
  },
  async updateBookingStatus(id: string, status: Booking["status"]): Promise<Booking | undefined> {
    BOOKINGS = BOOKINGS.map((booking) => booking.id === id ? { ...booking, status } : booking);
    return mockDelay(BOOKINGS.find((booking) => booking.id === id), 300);
  },
};
