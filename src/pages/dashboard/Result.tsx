import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { analysisService, interpolateDailyPrices } from "@/services/analysisService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/RiskBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR } from "@/utils/format";
import { ArrowUpRight, ArrowDownRight, ArrowRight, Timer, LineChart as LineIcon, Warehouse, CloudSun, Sparkles, ChevronLeft, Printer, FileDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

export function Result() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ["analysis", id], queryFn: () => analysisService.getById(id!), enabled: !!id });

  if (isLoading) return <div className="mx-auto max-w-5xl space-y-4"><Skeleton className="h-40" /><Skeleton className="h-40" /></div>;
  if (!data) return (
    <div className="mx-auto max-w-md text-center py-16">
      <p className="text-muted-foreground">Analysis not found.</p>
      <Button asChild className="mt-4"><Link to="/dashboard/new-analysis">Run one</Link></Button>
    </div>
  );

  const chart = interpolateDailyPrices(data.price.today, data.price.after_15_days);
  const TrendIcon = data.price.trend === "Increasing" ? ArrowUpRight : data.price.trend === "Decreasing" ? ArrowDownRight : ArrowRight;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 print:m-0 print:max-w-none print:p-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-3"><Link to="/dashboard"><ChevronLeft className="mr-1 h-4 w-4" /> Back</Link></Button>
          <h1 className="text-3xl font-bold tracking-tight">{data.crop} Analysis Report</h1>
          <p className="mt-1 text-sm text-muted-foreground">Analyzed {new Date(data.created_at).toLocaleString("en-IN")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print Report</Button>
          <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-primary-foreground"><FileDown className="mr-2 h-4 w-4" /> Export to PDF</Button>
        </div>
      </div>

      {/* Print header (visible only on print) */}
      <div className="hidden print:block mb-8 border-b pb-4">
        <h1 className="text-4xl font-black text-black">FasalSeva AI Analysis Report</h1>
        <p className="text-gray-500 mt-2">Crop: {data.crop} | Quantity: {data.quantity_kg} kg | Date: {new Date(data.created_at).toLocaleString("en-IN")}</p>
      </div>

      {/* Primary recommendation */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="print:shadow-none print:border">
        <Card className="overflow-hidden border-primary/30 bg-primary/5">
          <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:p-8">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-1 text-xs font-bold text-primary">
                <Sparkles className="h-3.5 w-3.5" /> AI Recommendation
              </span>
              <h2 className="mt-4 text-4xl font-black text-primary">{data.recommendation.action}
                {data.recommendation.duration_days > 0 && <span className="text-muted-foreground text-2xl font-semibold ml-2">for {data.recommendation.duration_days} days</span>}
              </h2>
              <p className="mt-3 max-w-2xl text-lg font-medium text-foreground/80 leading-relaxed">{data.recommendation.reason}</p>
              
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="bg-background rounded-xl p-4 border shadow-sm print:border-gray-200">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Expected Profit</p>
                  <p className="mt-1 text-2xl font-black text-primary">{formatINR(data.recommendation.expected_profit)}</p>
                </div>
                <div className="bg-background rounded-xl p-4 border shadow-sm print:border-gray-200">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Shelf Life Left</p>
                  <p className="mt-1 text-2xl font-black text-emerald-600">{data.spoilage.days_remaining} days</p>
                </div>
                <div className="bg-background rounded-xl p-4 border shadow-sm print:border-gray-200">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">AI Confidence</p>
                  <p className="mt-1 text-2xl font-black text-sky-600">{data.recommendation.confidence}%</p>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex flex-col items-center justify-center print:hidden">
              <ConfidenceRing pct={data.recommendation.confidence} />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Detail grid */}
      <div className="grid gap-6 lg:grid-cols-3 print:grid-cols-2">
        <Card className="p-6 border-emerald-500/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-emerald-600"><Timer className="h-5 w-5" /> Shelf Life Risk</span>
            <RiskBadge risk={data.spoilage.risk_level} />
          </div>
          <div className="mt-6 flex items-baseline gap-2">
            <p className="text-5xl font-black">{data.spoilage.days_remaining}</p>
            <p className="text-lg font-medium text-muted-foreground">days safe</p>
          </div>
          <div className="mt-6 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-300 font-medium">
            Store properly at recommended temperature and humidity to maintain this shelf life.
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2 border-amber-500/20 shadow-sm print:col-span-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-amber-600"><LineIcon className="h-5 w-5" /> Market Intelligence</span>
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${data.price.trend === "Increasing" ? "bg-emerald-500/10 text-emerald-600" : data.price.trend === "Decreasing" ? "bg-rose-500/10 text-rose-600" : "bg-sky-500/10 text-sky-600"}`}>
              <TrendIcon className="h-4 w-4" /> {data.price.trend}
            </span>
          </div>
          <div className="mt-6 flex items-end gap-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Today's Mandi Price</p>
              <p className="text-3xl font-bold">{formatINR(data.price.today)}<span className="text-base font-medium text-muted-foreground">/qtl</span></p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Forecast in 15 days</p>
              <p className="text-3xl font-bold">{formatINR(data.price.after_15_days)}<span className="text-base font-medium text-muted-foreground">/qtl</span></p>
            </div>
          </div>
          <div className="mt-6 h-40 print:hidden">
            <ResponsiveContainer>
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" hide />
                <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} formatter={(v: number) => [formatINR(v) + '/qtl', "Price Forecast"]} />
                <Area type="monotone" dataKey="price" stroke="var(--color-primary)" strokeWidth={3} fill="url(#rg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Profit Scenarios */}
        <Card className="p-6 lg:col-span-3 border-indigo-500/20 shadow-sm print:col-span-2">
           <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-indigo-600"><TrendingUp className="h-5 w-5" /> Profit Estimation</h3>
           <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-xl p-5 bg-background">
                <h4 className="font-semibold text-muted-foreground mb-4">Option 1: Sell Today</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span>Revenue ({data.quantity_kg}kg)</span><span className="font-medium">{formatINR(data.profit_options.sell_now.revenue)}</span></div>
                  <div className="flex justify-between text-rose-500"><span>Transport</span><span>-{formatINR(data.profit_options.sell_now.transport_cost)}</span></div>
                  <div className="flex justify-between text-rose-500"><span>Storage</span><span>-{formatINR(data.profit_options.sell_now.storage_cost)}</span></div>
                  <div className="pt-3 mt-3 border-t flex justify-between font-bold text-lg"><span>Net Profit</span><span>{formatINR(data.profit_options.sell_now.net_profit)}</span></div>
                </div>
              </div>
              <div className="border rounded-xl p-5 bg-indigo-500/5 border-indigo-500/20">
                <h4 className="font-semibold text-indigo-700 dark:text-indigo-400 mb-4">Option 2: Store ({data.spoilage.days_remaining > 15 ? 15 : data.spoilage.days_remaining} days)</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span>Expected Revenue</span><span className="font-medium">{formatINR(data.profit_options.store.revenue)}</span></div>
                  <div className="flex justify-between text-rose-500"><span>Transport</span><span>-{formatINR(data.profit_options.store.transport_cost)}</span></div>
                  <div className="flex justify-between text-rose-500"><span>Storage Cost</span><span>-{formatINR(data.profit_options.store.storage_cost)}</span></div>
                  <div className="pt-3 mt-3 border-t border-indigo-500/20 flex justify-between font-bold text-lg text-indigo-700 dark:text-indigo-400"><span>Net Profit</span><span>{formatINR(data.profit_options.store.net_profit)}</span></div>
                </div>
              </div>
           </div>
        </Card>
      </div>
      
      {/* Footer / Disclaimer for print */}
      <div className="hidden print:block mt-12 text-sm text-gray-400 border-t pt-4">
        Disclaimer: This report is generated by FasalSeva AI using predictive machine learning models. Market conditions are subject to change. Use this as an advisory tool.
      </div>
    </div>
  );
}

function ConfidenceRing({ pct }: { pct: number }) {
  const data = [{ name: "Confidence", value: pct, fill: "var(--color-primary)" }];
  
  return (
    <div className="relative w-32 h-32 flex flex-col items-center justify-center">
      <div className="absolute inset-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" barSize={8} data={data} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="z-10 flex flex-col items-center text-center mt-1">
        <span className="text-3xl font-black text-primary">{pct}%</span>
        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">Confidence</span>
      </div>
    </div>
  );
}
