import { describe, expect, it, beforeEach } from "vitest";
import { storageService } from "./storageService";

describe("storageService bookings", () => {
  beforeEach(() => {
    // reset in-memory state between tests by reloading module state indirectly through service calls
    // this test only needs the current service instance behavior
  });

  it("makes a booking visible to the storage owner", async () => {
    const facility = await storageService.registerStorage({
      owner_id: "owner_123",
      name: "Owner Test Storage",
      address: "Indore",
      lat: 22.7196,
      lng: 75.8577,
      compatible_crops: ["Tomato"],
      cost_per_kg_day: 0.2,
    });

    const booking = await storageService.bookStorage({
      facility_id: facility.id,
      crop: "Tomato",
      quantity_kg: 500,
      duration_days: 3,
    });

    const ownerBookings = await storageService.getBookings("owner_123");

    expect(booking.owner_id).toBe("owner_123");
    expect(ownerBookings.some((item: any) => item.id === booking.id)).toBe(true);
  });
});
