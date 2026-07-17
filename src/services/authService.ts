import { apiClient } from "@/api/client";
import { storageService } from "./storageService";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "farmer" | "storage_owner";
  hasStorage?: boolean;
  company_name?: string;
  state?: string;
  district?: string;
  preferred_language?: string;
}

const KEY = "fasalseva.user";
const TOKEN_KEY = "fasalseva.token";

export const authService = {
  currentUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
  },
  async resolveUser(user: AuthUser | null): Promise<AuthUser | null> {
    if (!user) return null;
    if (!user.role || user.role !== "storage_owner") return user;
    const storages = await storageService.getStorageByOwner(user.id);
    const resolvedUser = { ...user, hasStorage: storages.length > 0 };
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(resolvedUser));
    }
    return resolvedUser;
  },
  async hydrateCurrentUser(): Promise<AuthUser | null> {
    return this.resolveUser(this.currentUser());
  },
  async login(email: string, password: string, role: string = "farmer"): Promise<{ user: AuthUser }> {
    const response = await apiClient.post("/api/auth/login", { email, password, role });
    const user = response?.data?.user as AuthUser | undefined;
    if (!user) throw new Error(response?.data?.detail || "Invalid login response");
    const sessionUser: AuthUser = { ...user, hasStorage: (user.role === "storage_owner") ? false : undefined };
    const resolvedUser = await this.resolveUser(sessionUser);
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, response.data.access_token);
      localStorage.setItem(KEY, JSON.stringify(resolvedUser ?? sessionUser));
    }
    return { user: resolvedUser ?? sessionUser };
  },
  async signup(name: string, email: string, password: string, phone: string, role: AuthUser["role"] = "farmer"): Promise<AuthUser> {
    const response = await apiClient.post("/api/auth/signup", { name, email, password, phone, role });
    const user = response?.data?.user as AuthUser | undefined;
    if (!user) throw new Error(response?.data?.detail || "Invalid signup response");
    const sessionUser: AuthUser = { ...user, hasStorage: (user.role === "storage_owner") ? false : undefined };
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, response.data.access_token);
      localStorage.setItem(KEY, JSON.stringify(sessionUser));
    }
    return sessionUser;
  },
  updateCurrentUser(user: AuthUser) {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(user));
    return user;
  },
  async updateProfile(name: string, phone: string, company_name?: string, state?: string, district?: string, preferred_language?: string): Promise<AuthUser> {
    const response = await apiClient.put("/api/user/profile", { name, phone, company_name, state, district, preferred_language });
    const user = response?.data as AuthUser | undefined;
    if (!user) throw new Error("Failed to update profile");
    const sessionUser = { ...this.currentUser(), ...user };
    this.updateCurrentUser(sessionUser as AuthUser);
    return sessionUser as AuthUser;
  },
  logout() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(KEY);
    localStorage.removeItem(TOKEN_KEY);
  },
};
