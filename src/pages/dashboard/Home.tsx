import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, Cloud, Droplets, Thermometer, TrendingUp, Sparkles, Wheat } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/RiskBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { weatherService } from "@/services/weatherService";
import { analysisService, interpolateDailyPrices } from "@/services/analysisService";
import { useAuth } from "@/contexts/AuthContext";
import { formatINR } from "@/utils/format";

export function DashboardHome() {
  const { user } = useAuth();
  const { data: weather } = useQuery({ queryKey: ["weather","Indore"], queryFn: () => weatherService.getWeather("Indore, MP") });
  const { data: history, isLoading } = useQuery({ queryKey: ["history"], queryFn: () => analysisService.getHistory() });

  const latest = history?.[0];
  const chartData = latest ? interpolateDailyPrices(latest.price.today, latest.price.after_15_days) : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Namaste, {user?.name?.split(" ")[0] ?? "Farmer"} 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's a quick look at your farm today.</p>
        </div>
        <Button asChild className="gradient-primary text-primary-foreground">
          <Link to="/dashboard/new-analysis">New analysis <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Cloud className="h-5 w-5" /></span>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Weather</p>
              <p className="text-lg font-semibold">{weather?.temperature ?? "—"}°C · {weather?.humidity ?? "—"}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent/15 text-accent-foreground"><Thermometer className="h-5 w-5" /></span>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Spoilage alert</p>
              <p className="text-lg font-semibold">{weather?.spoilage_alert ?? "—"}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary/40"><Wheat className="h-5 w-5" /></span>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Active analyses</p>
              <p className="text-lg font-semibold">{history?.length ?? 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><TrendingUp className="h-5 w-5" /></span>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Latest recommendation</p>
              <p className="text-lg font-semibold">{latest?.recommendation.action ?? "—"}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Price trend (illustrative)</p>
              <h3 className="mt-1 text-xl font-semibold">
                {latest ? `${latest.crop} — ₹${latest.price.today}/qtl → ₹${latest.price.after_15_days}/qtl` : "Run an analysis to see forecasts"}
              </h3>
            </div>
            {latest && <RiskBadge risk={latest.spoilage.risk_level} />}
          </div>
          <div className="mt-4 h-56">
            {latest ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} width={50} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} formatter={(v: number) => [`₹${v}/qtl`, "Price"]} />
                  <Area type="monotone" dataKey="price" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">
                <Link to="/dashboard/new-analysis" className="rounded-lg border border-dashed border-border px-6 py-4 hover:bg-muted">Start your first analysis →</Link>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Weather intelligence</p>
          <p className="mt-1 text-lg font-semibold">Indore, MP</p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-foreground"><Thermometer className="h-4 w-4" /> Temperature</span><b>{weather?.temperature}°C</b></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-foreground"><Droplets className="h-4 w-4" /> Humidity</span><b>{weather?.humidity}%</b></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-foreground"><Cloud className="h-4 w-4" /> Rain (48h)</span><b>{weather?.rain_next_48h_mm} mm</b></div>
          </div>
          <p className="mt-4 rounded-lg bg-warning/10 p-3 text-xs text-foreground/80">
            <Sparkles className="mr-1 inline h-3.5 w-3.5 text-warning" /> {weather?.forecast_summary}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent analyses</h3>
          <Button asChild variant="ghost" size="sm"><Link to="/dashboard/history">View all</Link></Button>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : (history?.length ?? 0) === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No analyses yet. <Link to="/dashboard/new-analysis" className="text-primary underline">Run your first</Link>.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {history!.slice(0, 5).map((h) => (
              <Link key={h.id} to={`/dashboard/result/${h.id}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 hover:bg-muted/40 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
                <div className="min-w-0">
                  <p className="truncate font-medium">{h.crop} · {h.quantity_kg} kg</p>
                  <p className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString("en-IN")}</p>
                </div>
                <RiskBadge risk={h.spoilage.risk_level} className="hidden sm:inline-flex" />
                <span className="hidden text-sm font-medium sm:inline">{h.recommendation.action}</span>
                <span className="text-sm font-semibold text-primary">{formatINR(h.recommendation.expected_profit)}</span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
