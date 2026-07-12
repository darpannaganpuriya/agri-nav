import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";


import { PublicLayout } from "@/layouts/PublicLayout";
import { FarmerDashboardLayout } from "@/layouts/FarmerDashboardLayout";

import { Landing } from "@/pages/Landing";
import { Schemes } from "@/pages/Schemes";
import { Login } from "@/pages/auth/Login";
import { Signup } from "@/pages/auth/Signup";

import { DashboardHome } from "@/pages/dashboard/Home";
import { NewAnalysis } from "@/pages/dashboard/NewAnalysis";
import { Result } from "@/pages/dashboard/Result";
import { ProfitSimulator } from "@/pages/dashboard/ProfitSimulator";
import { Market } from "@/pages/dashboard/Market";
import { ColdStorage } from "@/pages/dashboard/ColdStorage";
import { Weather } from "@/pages/dashboard/Weather";
import { History } from "@/pages/dashboard/History";
import { Profile, Settings } from "@/pages/dashboard/Profile";

export function App() {
  // BrowserRouter uses window.location, so mount only after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public marketing pages */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/schemes" element={<Schemes />} />
            </Route>

            {/* Auth (no shell) */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Farmer dashboard */}
            <Route path="/dashboard" element={<FarmerDashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="new-analysis" element={<NewAnalysis />} />
              <Route path="result/:id" element={<Result />} />
              <Route path="profit/:id" element={<ProfitSimulator />} />
              <Route path="market" element={<Market />} />
              <Route path="cold-storage" element={<ColdStorage />} />
              <Route path="weather" element={<Weather />} />
              <Route path="history" element={<History />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
