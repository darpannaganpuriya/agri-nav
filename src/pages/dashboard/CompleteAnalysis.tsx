import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, ArrowRight, BrainCircuit, Droplets, Leaf, Loader2, Sparkles, Thermometer, Timer, TrendingUp, Warehouse } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CROPS, STATES, STATE_DISTRICTS } from "@/constants/data";
import { completeAnalysisService } from "@/services/completeAnalysisService";
import type { CompleteAnalysisInput, CompleteAnalysisResult } from "@/types";
import { toast } from "sonner";
import { RiskBadge } from "@/components/RiskBadge";
import { formatINR } from "@/utils/format";
import { useLanguage } from "@/contexts/LanguageContext";

const defaultForm: CompleteAnalysisInput = {
  crop: "Tomato",
  state: "Maharashtra",
  district: "Pune",
  current_price: 500,
  month: new Date().getMonth() + 1,
  week: 1,
  temperature: 24,
  humidity: 72,
  days_stored: 3,
  quantity_kg: 1000,
  transport_cost: 1.5,
  storage_cost: 0.2,
};

export function CompleteAnalysis() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form, setForm] = useState<CompleteAnalysisInput>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompleteAnalysisResult | null>(null);

  const districts = STATE_DISTRICTS[form.state] || [];

  const handleGenerate = async () => {
    if (form.quantity_kg <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }
    try {
      setLoading(true);
      const res = await completeAnalysisService.runAnalysis(form);
      setResult(res);
      toast.success("Complete analysis generated successfully.");
    } catch (err) {
      toast.error("Failed to generate complete analysis.");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Button variant="ghost" onClick={() => setResult(null)} className="-ml-3 mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("back_to_form") || "Back to form"}
        </Button>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight text-purple-600 dark:text-purple-400 flex items-center gap-2">
            <Sparkles className="h-8 w-8" /> {t("complete_ai_analysis") || "Complete AI Analysis"}
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            {result.crop} • {result.quantity_kg} kg • {new Date(result.created_at).toLocaleDateString("en-IN")}
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Section 1: Shelf Life */}
          <Card className="p-6 border-purple-500/20">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><Timer className="h-5 w-5 text-emerald-500" /> {t("shelf_life") || "Shelf Life"}</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Remaining Safe Days</p>
                <p className="text-2xl font-bold text-emerald-600">{result.shelf_life.days_remaining} {t("days") || "days"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <RiskBadge risk={result.shelf_life.risk_level} />
              </div>
            </div>
            <p className="mt-4 text-sm bg-muted/50 p-3 rounded-lg border border-border/50">
              <span className="font-medium text-foreground">Recommendation:</span> {result.shelf_life.recommendation}
            </p>
          </Card>

          {/* Section 2: Market Intelligence */}
          <Card className="p-6 border-purple-500/20">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><TrendingUp className="h-5 w-5 text-amber-500" /> {t("market_intelligence") || "Market Intelligence"}</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Today's Price</p>
                <p className="text-2xl font-bold">{formatINR(result.market.today)}<span className="text-sm text-muted-foreground">/qtl</span></p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Predicted (15 Days)</p>
                <p className="text-2xl font-bold">{formatINR(result.market.after_15_days)}<span className="text-sm text-muted-foreground">/qtl</span></p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm bg-muted/50 p-3 rounded-lg border border-border/50">
              <span className="font-medium">Trend: <span className={result.market.trend === "Increasing" ? "text-emerald-600" : result.market.trend === "Decreasing" ? "text-rose-600" : "text-sky-600"}>{result.market.trend}</span></span>
              <span>Confidence: {result.market.confidence}%</span>
            </div>
          </Card>

          {/* Section 3: Best Selling Recommendation */}
          <Card className="p-6 border-purple-500/50 bg-purple-500/5 md:col-span-2">
            <h3 className="flex items-center gap-2 text-xl font-bold text-purple-700 dark:text-purple-300">
              <Sparkles className="h-6 w-6" /> {t("best_selling_recommendation") || "Best Selling Recommendation"}
            </h3>
            <div className="mt-6 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 bg-background p-6 rounded-xl border shadow-sm">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Recommended Action</p>
                <p className="text-3xl font-black text-primary">{result.best_selling.action}</p>
                {result.best_selling.store_until > 0 && (
                  <p className="mt-2 text-emerald-600 font-medium">Store for {result.best_selling.store_until} days</p>
                )}
              </div>
              <div className="flex-[2]">
                <p className="text-lg font-medium leading-relaxed">{result.best_selling.reason}</p>
              </div>
            </div>
          </Card>

          {/* Section 5: Profit Estimation */}
          <Card className="p-6 md:col-span-2">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><TrendingUp className="h-5 w-5" /> {t("profit_estimation") || "Profit Estimation"}</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border p-4">
                <h4 className="font-medium mb-4 text-muted-foreground">Option 1: Sell Today</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Expected Revenue</span><span>{formatINR(result.profit.sell_now.revenue)}</span></div>
                  <div className="flex justify-between text-rose-500"><span>Transport Cost</span><span>-{formatINR(result.profit.sell_now.transport_cost)}</span></div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-lg"><span>Net Profit</span><span>{formatINR(result.profit.sell_now.net_profit)}</span></div>
                </div>
              </div>
              <div className="rounded-xl border p-4 bg-primary/5 border-primary/20">
                <h4 className="font-medium mb-4 text-primary">Option 2: Store for {result.best_selling.store_until || 15} days</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Expected Revenue</span><span>{formatINR(result.profit.store.revenue)}</span></div>
                  <div className="flex justify-between text-rose-500"><span>Storage Cost</span><span>-{formatINR(result.profit.store.storage_cost)}</span></div>
                  <div className="flex justify-between text-rose-500"><span>Transport Cost</span><span>-{formatINR(result.profit.store.transport_cost)}</span></div>
                  <Separator className="my-2 border-primary/20" />
                  <div className="flex justify-between font-bold text-lg text-primary"><span>Net Profit</span><span>{formatINR(result.profit.store.net_profit)}</span></div>
                </div>
              </div>
            </div>
            {result.profit.store.net_profit > result.profit.sell_now.net_profit && (
              <p className="mt-4 text-center text-sm font-medium text-emerald-600 bg-emerald-50 p-2 rounded-lg dark:bg-emerald-500/10">
                Storing yields an expected extra profit of {formatINR(result.profit.store.net_profit - result.profit.sell_now.net_profit)}.
              </p>
            )}
          </Card>

          {/* Section 4: Cold Storage */}
          {result.cold_storage.recommended && result.cold_storage.facility && (
            <Card className="p-6 md:col-span-2 border-sky-500/30 bg-sky-50 dark:bg-sky-500/5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-sky-700 dark:text-sky-300"><Warehouse className="h-5 w-5" /> Recommended Cold Storage</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Since storing is recommended, we found a nearby facility for you.</p>
                </div>
                <Button className="bg-sky-600 hover:bg-sky-700 text-white" onClick={() => navigate(`/dashboard/cold-storage/${result.cold_storage.facility?.id}`)}>View Details</Button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-6 rounded-xl bg-background p-4 border">
                <div>
                  <p className="text-sm font-semibold">{result.cold_storage.facility.name}</p>
                  <p className="text-xs text-muted-foreground">{result.cold_storage.facility.district}, {result.cold_storage.facility.state}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Available Space</p>
                  <p className="text-sm font-semibold">{result.cold_storage.facility.available_tons} Tons</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estimated Cost</p>
                  <p className="text-sm font-semibold font-mono">₹{result.cold_storage.facility.cost_per_kg_day}/kg/day</p>
                </div>
              </div>
            </Card>
          )}

          {/* Section 6: AI Advice (Groq) */}
          <Card className="p-6 md:col-span-2 border-emerald-500/30 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
            <h3 className="flex items-center gap-2 text-lg font-bold text-emerald-800 dark:text-emerald-300"><BrainCircuit className="h-5 w-5" /> Expert AI Advice</h3>
            <p className="mt-3 text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed text-lg">
              "{result.ai_advice}"
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // --- FORM VIEW ---
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-purple-600 dark:text-purple-400 flex items-center gap-2">
            <Sparkles className="h-6 w-6" /> {t("complete_ai_analysis") || "Complete AI Analysis"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Run both shelf-life and market predictions combined with AI profit intelligence.</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Crop Info */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><Leaf className="h-4 w-4 text-emerald-500" /> Crop Details</h3>
            <div className="space-y-2">
              <Label>Crop Name</Label>
              <Select value={form.crop} onValueChange={(v) => setForm({ ...form, crop: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CROPS.filter(c => c.priceModel).map((c) => (
                    <SelectItem key={c.name} value={c.name}>{c.emoji} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity (kg)</Label>
              <Input type="number" min={1} value={form.quantity_kg} onChange={(e) => setForm({ ...form, quantity_kg: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Days Already Stored</Label>
              <Input type="number" min={0} value={form.days_stored} onChange={(e) => setForm({ ...form, days_stored: Number(e.target.value) })} />
            </div>
          </div>

          {/* Location & Market */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-amber-500" /> Location & Market</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>State</Label>
                <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v, district: STATE_DISTRICTS[v][0] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>District</Label>
                <Select value={form.district} onValueChange={(v) => setForm({ ...form, district: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Current Mandi Price (₹/quintal)</Label>
              <Input type="number" value={form.current_price} onChange={(e) => setForm({ ...form, current_price: Number(e.target.value) })} />
            </div>
          </div>

          <Separator className="col-span-full" />

          {/* Environment */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><Thermometer className="h-4 w-4 text-rose-500" /> Storage Environment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Temperature (°C)</Label>
                <Input type="number" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Humidity (%)</Label>
                <Input type="number" value={form.humidity} onChange={(e) => setForm({ ...form, humidity: Number(e.target.value) })} />
              </div>
            </div>
          </div>

          {/* Costs */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><ArrowRight className="h-4 w-4 text-primary" /> Transportation & Costs</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Transport (₹/kg)</Label>
                <Input type="number" step="0.1" value={form.transport_cost} onChange={(e) => setForm({ ...form, transport_cost: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Storage Cost (₹/kg/day)</Label>
                <Input type="number" step="0.1" value={form.storage_cost} onChange={(e) => setForm({ ...form, storage_cost: Number(e.target.value) })} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button onClick={handleGenerate} disabled={loading} size="lg" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg py-6 shadow-xl shadow-purple-500/20 transition-all hover:-translate-y-1">
            {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Complete Analysis...</> : <><Sparkles className="mr-2 h-5 w-5" /> Generate Complete Analysis</>}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1"><BrainCircuit className="h-3 w-3" /> Powered by FasalSeva AI Decision Engine & Groq</p>
        </div>
      </Card>
    </div>
  );
}
