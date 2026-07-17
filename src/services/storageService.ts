import { apiClient } from "@/api/client";
import type { StorageFacility, Booking, BookingInput, CropName } from "@/types";
import coldStorageImg from "@/assets/cold-storage.jpg";

function normalizeStorage(storage: any): StorageFacility {
  return {
    id: storage.id,
    owner_id: storage.owner_id,
    name: storage.name,
    address: storage.address,
    state: storage.state,
    district: storage.district,
    pincode: storage.pincode,
    lat: storage.lat,
    lng: storage.lng,
    distance_km: 0,
    capacity_tons: Math.round((storage.total_capacity_kg ?? 0) / 1000),
    available_tons: Math.round((storage.available_capacity_kg ?? 0) / 1000),
    occupied_tons: Math.max(0, Math.round(((storage.total_capacity_kg ?? 0) - (storage.available_capacity_kg ?? 0)) / 1000)),
    cost_per_kg_day: storage.cost_per_kg_day ?? 0.2,
    compatible_crops: storage.compatible_crops ?? [],
    rating: 4.5,
    image: coldStorageImg,
    amenities: storage.facilities ?? ["24/7 Security"],
    verification_status: storage.verification_status ?? "Pending",
    status: storage.status ?? "Active",
    temperature_range: storage.temperature_range,
    humidity_range: storage.humidity_range,
    facilities: storage.facilities ?? [],
    total_capacity_kg: storage.total_capacity_kg,
    available_capacity_kg: storage.available_capacity_kg,
    occupied_capacity_kg: storage.total_capacity_kg ? storage.total_capacity_kg - storage.available_capacity_kg : 0,
  } as StorageFacility;
}

export const storageService = {
  async registerStorage(input: Omit<StorageFacility, "id" | "distance_km" | "capacity_tons" | "available_tons" | "rating" | "image" | "amenities" | "verification_status" | "status"> & { image?: string; distance_km?: number; capacity_tons?: number; available_tons?: number; rating?: number; amenities?: string[]; verification_status?: string; status?: "Active" | "Paused" }): Promise<StorageFacility> {
    const response = await apiClient.post("/api/storage", {
      name: input.name,
      owner_id: input.owner_id,
      owner_name: input.owner_name,
      phone: input.phone,
      email: input.email,
      address: input.address,
      state: input.state,
      district: input.district,
      pincode: input.pincode,
      lat: input.lat,
      lng: input.lng,
      cost_per_kg_day: input.cost_per_kg_day,
      compatible_crops: input.compatible_crops,
      total_capacity_kg: input.total_capacity_kg ?? 0,
      available_capacity_kg: input.available_capacity_kg ?? 0,
      temperature_range: input.temperature_range,
      humidity_range: input.humidity_range,
      facilities: input.facilities,
    });
    return normalizeStorage(response.data);
  },
  async getAllStorages(): Promise<StorageFacility[]> {
    const response = await apiClient.get("/api/storage");
    return response.data.map(normalizeStorage).sort((a: StorageFacility, b: StorageFacility) => a.distance_km - b.distance_km);
  },
  async getStorageByOwner(ownerId?: string): Promise<StorageFacility[]> {
    const response = await apiClient.get(`/api/storage/owner/${ownerId ?? ""}`);
    return response.data.map(normalizeStorage);
  },
  async getFacilities(filters?: { crop?: CropName; maxDistance?: number }): Promise<StorageFacility[]> {
    const response = await apiClient.get("/api/storage");
    return response.data
      .map(normalizeStorage)
      .filter((f: StorageFacility) => !filters?.crop || f.compatible_crops.includes(filters.crop))
      .filter((f: StorageFacility) => !filters?.maxDistance || f.distance_km <= filters.maxDistance)
      .sort((a: StorageFacility, b: StorageFacility) => a.distance_km - b.distance_km);
  },
  async updateStorage(id: string, updates: Partial<StorageFacility>): Promise<StorageFacility | undefined> {
    const response = await apiClient.put(`/api/storage/${id}`, updates);
    return normalizeStorage(response.data);
  },
  async deleteStorage(id: string): Promise<boolean> {
    await apiClient.delete(`/api/storage/${id}`);
    return true;
  },
  async updateAvailability(id: string, availableTons: number): Promise<StorageFacility | undefined> {
    return this.updateStorage(id, { available_tons: availableTons, occupied_tons: Math.max(0, availableTons) } as Partial<StorageFacility>);
  },
  async bookStorage(input: BookingInput): Promise<Booking> {
    const response = await apiClient.post("/api/storage/bookings", input);
    return {
      ...response.data,
      facility_name: "Storage",
      created_at: response.data.created_at ?? new Date().toISOString(),
    } as Booking;
  },
  async getFarmerBookings(): Promise<Booking[]> {
    const response = await apiClient.get("/api/storage/bookings/farmer");
    return response.data;
  },
  async getOwnerBookings(): Promise<Booking[]> {
    const response = await apiClient.get("/api/storage/bookings/storage-owner");
    return response.data;
  },
  async updateBookingStatus(id: string, status: Booking["status"]): Promise<Booking | undefined> {
    const response = await apiClient.put(`/api/storage/bookings/${id}`, { status });
    return response.data as Booking;
  },
};
