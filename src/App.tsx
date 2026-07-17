import { useEffect, useState, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

import { PublicLayout } from "@/layouts/PublicLayout";
import { FarmerDashboardLayout } from "@/layouts/FarmerDashboardLayout";
import { StorageOwnerLayout } from "@/layouts/StorageOwnerLayout";

import { Landing } from "@/pages/Landing";
import { Schemes } from "@/pages/Schemes";
import { Login } from "@/pages/auth/Login";
import { Signup } from "@/pages/auth/Signup";

import { DashboardHome } from "@/pages/dashboard/Home";
import { NewAnalysis } from "@/pages/dashboard/NewAnalysis";
import { PricePrediction } from "@/pages/dashboard/PricePrediction";
import { ShelfLifePrediction } from "@/pages/dashboard/ShelfLifePrediction";
import { Result } from "@/pages/dashboard/Result";
import { ProfitSimulator } from "@/pages/dashboard/ProfitSimulator";
import { Market } from "@/pages/dashboard/Market";
import { ColdStorage } from "@/pages/dashboard/ColdStorage";
import { Weather } from "@/pages/dashboard/Weather";
import { History } from "@/pages/dashboard/History";
import { Profile, Settings } from "@/pages/dashboard/Profile";
import { StorageOnboarding } from "@/pages/storage/Onboarding";
import { StorageOwnerDashboard } from "@/pages/storage/Dashboard";
import { StorageMyStorage } from "@/pages/storage/MyStorage";
import { StorageBookings } from "@/pages/storage/Bookings";
import { StorageAvailability } from "@/pages/storage/Availability";
import { StoragePricing } from "@/pages/storage/Pricing";
import { StorageAnalytics } from "@/pages/storage/Analytics";
import { StorageProfile } from "@/pages/storage/Profile";
import { StorageSettings } from "@/pages/storage/Settings";

function RequireFarmer({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "storage_owner") return <Navigate to="/storage/dashboard" replace />;
  return <>{children}</>;
}

function RequireOnboarding({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "storage_owner") return <Navigate to="/dashboard" replace />;
  if (user.hasStorage) return <Navigate to="/storage/dashboard" replace />;
  return <>{children}</>;
}

function RequireStorageOwnerDashboard({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "storage_owner") return <Navigate to="/dashboard" replace />;
  if (!user.hasStorage) return <Navigate to="/storage/onboarding" replace />;
  return <>{children}</>;
}

export function App() {
  // BrowserRouter uses window.location, so mount only after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <LanguageProvider>
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
            <Route path="/dashboard" element={<RequireFarmer><FarmerDashboardLayout /></RequireFarmer>}>
              <Route index element={<DashboardHome />} />
              <Route path="new-analysis" element={<NewAnalysis />} />
              <Route path="new-analysis/spoilage" element={<ShelfLifePrediction />} />
              <Route path="new-analysis/price-prediction" element={<PricePrediction />} />
              <Route path="result/:id" element={<Result />} />
              <Route path="profit/:id" element={<ProfitSimulator />} />
              <Route path="market" element={<Market />} />
              <Route path="cold-storage" element={<ColdStorage />} />
              <Route path="weather" element={<Weather />} />
              <Route path="history" element={<History />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Storage owner flow */}
            <Route path="/storage/onboarding" element={<RequireOnboarding><StorageOnboarding /></RequireOnboarding>} />
            <Route path="/storage" element={<RequireStorageOwnerDashboard><StorageOwnerLayout /></RequireStorageOwnerDashboard>}>
              <Route index element={<Navigate to="/storage/dashboard" replace />} />
              <Route path="dashboard" element={<StorageOwnerDashboard />} />
              <Route path="my-storage" element={<StorageMyStorage />} />
              <Route path="bookings" element={<StorageBookings />} />
              <Route path="availability" element={<StorageAvailability />} />
              <Route path="pricing" element={<StoragePricing />} />
              <Route path="analytics" element={<StorageAnalytics />} />
              <Route path="profile" element={<StorageProfile />} />
              <Route path="settings" element={<StorageSettings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
    </LanguageProvider>
  );
}
