import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService, type AuthUser } from "@/services/authService";

const AuthCtx = createContext<{
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  logout: () => void;
}>({ user: null, setUser: () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    let active = true;
    const loadUser = async () => {
      const resolvedUser = await authService.hydrateCurrentUser();
      if (active) setUser(resolvedUser);
    };
    loadUser();
    return () => {
      active = false;
    };
  }, []);
  return (
    <AuthCtx.Provider value={{
      user, setUser,
      logout: () => { authService.logout(); setUser(null); },
    }}>{children}</AuthCtx.Provider>
  );
}
export const useAuth = () => useContext(AuthCtx);
