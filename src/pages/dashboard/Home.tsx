import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, Cloud, Droplets, Thermometer, TrendingUp, Sparkles, Wheat, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/RiskBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { weatherService } from "@/services/weatherService";
import { analysisService, interpolateDailyPrices } from "@/services/analysisService";
import { storageService } from "@/services/storageService";
import { useAuth } from "@/contexts/AuthContext";
import { formatINR } from "@/utils/format";
import { Package } from "lucide-react";

// Mock weekly data for a richer dashboard
const weeklyActivityData = [
  { day: "Mon", revenue: 12000 },
  { day: "Tue", revenue: 19000 },
  { day: "Wed", revenue: 15000 },
  { day: "Thu", revenue: 22000 },
  { day: "Fri", revenue: 28000 },
  { day: "Sat", revenue: 21000 },
  { day: "Sun", revenue: 32000 },
];

export function DashboardHome() {
  const { user } = useAuth();
  const { data: weather } = useQuery({ queryKey: ["weather","Indore"], queryFn: () => weatherService.getWeather("Indore, MP") });
  const { data: history, isLoading } = useQuery({ queryKey: ["history"], queryFn: () => analysisService.getHistory() });
  const { data: bookings, isLoading: isLoadingBookings } = useQuery({ queryKey: ["bookings", "farmer"], queryFn: () => storageService.getFarmerBookings() });

  const latest = history?.[0];
  const chartData = latest ? interpolateDailyPrices(latest.price.today, latest.price.after_15_days) : [];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">Namaste, {user?.name?.split(" ")[0] ?? "Farmer"} 🙏</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's a quick look at your farm's performance and AI insights today.</p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-1">
          <Link to="/dashboard/new-analysis">Run AI Analysis <Sparkles className="ml-2 h-4 w-4" /></Link>
        </Button>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 border-emerald-500/20 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"><Cloud className="h-6 w-6" /></span>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Local Weather</p>
              <p className="text-xl font-bold text-foreground">{weather?.temperature ?? "--"}°C <span className="text-sm font-medium text-muted-foreground">| {weather?.humidity ?? "--"}% H</span></p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-rose-500/20 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"><Thermometer className="h-6 w-6" /></span>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Spoilage Risk</p>
              <p className="text-xl font-bold text-foreground">{weather?.spoilage_alert ?? "--"}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-indigo-500/20 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"><Wheat className="h-6 w-6" /></span>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Total Analyses</p>
              <p className="text-xl font-bold text-foreground">{history?.length ?? 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-amber-500/20 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"><TrendingUp className="h-6 w-6" /></span>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Latest Action</p>
              <p className="text-xl font-bold text-foreground">{latest?.recommendation.action ?? "--"}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chart */}
        <Card className="p-6 lg:col-span-2 shadow-sm border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Market Forecast</p>
              <h3 className="mt-1 text-2xl font-bold">
                {latest ? `${latest.crop} Trend` : "Run an analysis to see forecasts"}
              </h3>
            </div>
            {latest && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Expected High</p>
                <p className="text-lg font-bold text-emerald-600">{formatINR(latest.price.after_15_days)}/qtl</p>
              </div>
            )}
          </div>
          <div className="mt-8 h-64">
            {latest ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} tickMargin={10} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} width={60} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip cursor={{ stroke: 'var(--color-border)' }} contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} formatter={(v: number) => [`₹${v}/qtl`, "Predicted Price"]} />
                  <Area type="monotone" dataKey="price" stroke="var(--color-primary)" strokeWidth={3} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">
                <Link to="/dashboard/new-analysis" className="rounded-xl border-2 border-dashed border-border px-8 py-6 hover:bg-muted/50 transition-colors flex flex-col items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <span className="font-medium">Start your first analysis</span>
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* Side Panel */}
        <div className="space-y-6">
          <Card className="p-6 shadow-sm bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/20 dark:to-indigo-950/20 border-sky-500/20">
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">Weather Intelligence</p>
            <p className="mt-1 text-2xl font-bold">Indore, MP</p>
            <div className="mt-6 space-y-4 text-sm bg-background/50 rounded-xl p-4 border border-white/20 dark:border-white/5 shadow-inner">
              <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-foreground"><Thermometer className="h-4 w-4 text-rose-500" /> Temperature</span><b className="text-base">{weather?.temperature ?? "--"}°C</b></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-foreground"><Droplets className="h-4 w-4 text-sky-500" /> Humidity</span><b className="text-base">{weather?.humidity ?? "--"}%</b></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-foreground"><Cloud className="h-4 w-4 text-slate-500" /> Rain (48h)</span><b className="text-base">{weather?.rain_next_48h_mm ?? "--"} mm</b></div>
            </div>
            <p className="mt-4 rounded-xl bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200 font-medium flex gap-2 items-start border border-amber-500/20">
              <Sparkles className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" /> 
              <span>{weather?.forecast_summary ?? "Waiting for weather data..."}</span>
            </p>
          </Card>

          <Card className="p-6 shadow-sm border-border/60">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Est. Weekly Revenue</p>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivityData}>
                  <Tooltip cursor={{ fill: 'var(--color-muted)' }} contentStyle={{ borderRadius: 8 }} formatter={(v: number) => [`₹${v}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="var(--color-emerald-500)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-6 shadow-sm border-border/60">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h3 className="text-xl font-bold">Recent Analyses</h3>
          <Button asChild variant="outline" size="sm" className="font-semibold"><Link to="/dashboard/history">View all history <ChevronRight className="ml-1 h-4 w-4" /></Link></Button>
        </div>
        {isLoading ? (
          <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
        ) : (history?.length ?? 0) === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center">
            <Wheat className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No analyses yet.</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Run an AI analysis to see it here.</p>
            <Button asChild><Link to="/dashboard/new-analysis">Run your first analysis</Link></Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {history!.slice(0, 3).map((h) => (
              <Link key={h.id} to={`/dashboard/result/${h.id}`}>
                <div className="flex flex-col gap-3 rounded-xl border p-4 transition-all hover:border-primary/50 hover:shadow-md bg-background">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-lg">{h.crop}</p>
                      <p className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleDateString("en-IN")}</p>
                    </div>
                    <RiskBadge risk={h.spoilage.risk_level} />
                  </div>
                  <div className="flex items-center justify-between border-t pt-3 mt-1">
                    <span className="text-sm font-medium px-2 py-1 bg-primary/10 text-primary rounded-md">{h.recommendation.action}</span>
                    <span className="font-bold text-emerald-600">{formatINR(h.recommendation.expected_profit)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Storage Bookings Widget */}
      <Card className="p-6 shadow-sm border-border/60">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h3 className="text-xl font-bold">Recent Storage Bookings</h3>
        </div>
        {isLoadingBookings ? (
          <div className="space-y-4">{[1,2].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
        ) : (bookings?.length ?? 0) === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No storage bookings yet.</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Book a cold storage facility near you.</p>
            <Button asChild><Link to="/dashboard/storage">Find Cold Storage</Link></Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bookings!.slice(0, 3).map((b) => (
              <Link key={b.id} to={`/dashboard/bookings/${b.id}`}>
                <div className="flex flex-col gap-3 rounded-xl border p-4 transition-all hover:border-primary/50 hover:shadow-md bg-background">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-lg">{b.crop}</p>
                      <p className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString("en-IN")}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${b.status === "Pending" ? "bg-amber-100 text-amber-700" : b.status === "Accepted" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{b.status}</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3 mt-1 text-sm">
                    <span className="text-muted-foreground">{b.quantity_kg} kg</span>
                    <span className="font-bold">{formatINR(b.estimated_cost)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
