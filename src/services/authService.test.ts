import { beforeEach, describe, expect, it } from "vitest";
import { authService } from "./authService";
import { storageService } from "./storageService";

describe("authService", () => {
  beforeEach(() => {
    localStorage.clear();
    authService.logout();
  });

  it("stores a user and authenticates with email and password", async () => {
    const created = await authService.signup(
      "Ravi Kumar",
      "ravi@example.com",
      "secret123",
      "9876543210",
      "farmer"
    );

    expect(created.email).toBe("ravi@example.com");

    const result = await authService.login("ravi@example.com", "secret123");

    expect(result.user.email).toBe("ravi@example.com");
    expect(result.user.role).toBe("farmer");
  });

  it("flags storage owners as having storage when they already registered one", async () => {
    const created = await authService.signup(
      "Cold Store Owner",
      "owner@example.com",
      "secret123",
      "9999999999",
      "storage_owner"
    );

    await storageService.registerStorage({
      owner_id: created.id,
      name: "Green Valley Cold Storage",
      address: "Indore",
      lat: 22.7196,
      lng: 75.8577,
      compatible_crops: ["Tomato"],
      cost_per_kg_day: 0.2,
    });

    const result = await authService.login("owner@example.com", "secret123");

    expect(result.user.hasStorage).toBe(true);
  });
});
