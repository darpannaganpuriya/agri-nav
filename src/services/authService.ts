import { mockDelay } from "@/api/client";

export interface AuthUser { id: string; name: string; phone: string; role: "farmer" | "storage_owner"; }

const KEY = "fasalseva.user";

export const authService = {
  currentUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
  },
  async login(phone: string): Promise<{ requiresOtp: true }> {
    return mockDelay({ requiresOtp: true as const }, 500);
  },
  async verifyOtp(phone: string, _otp: string, name = "Ramesh Patel"): Promise<AuthUser> {
    const user: AuthUser = { id: "u_1", name, phone, role: "farmer" };
    localStorage.setItem(KEY, JSON.stringify(user));
    return mockDelay(user, 500);
  },
  async signup(name: string, phone: string, role: AuthUser["role"] = "farmer"): Promise<{ requiresOtp: true }> {
    localStorage.setItem("fasalseva.pending", JSON.stringify({ name, phone, role }));
    return mockDelay({ requiresOtp: true as const }, 500);
  },
  logout() { localStorage.removeItem(KEY); },
};
