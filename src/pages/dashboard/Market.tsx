import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { marketService, CROP_BASE_PRICE_PER_QUINTAL } from "@/services/marketService";
import { CROPS, STATES, STATE_DISTRICTS } from "@/constants/data";
import type { CropName } from "@/types";
import { Area, AreaChart, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Market() {
  const [crop, setCrop] = useState<CropName>("Tomato");
  const [state, setState] = useState("Madhya Pradesh");
  const [district, setDistrict] = useState("Indore");
  const [price, setPrice] = useState(CROP_BASE_PRICE_PER_QUINTAL.Tomato);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["market", crop, state, district, price],
    queryFn: () => marketService.getPriceForecast({
      crop, state, district, current_price: price,
      month: new Date().getMonth() + 1, week: Math.ceil((new Date().getDate() + 1) / 7),
    }),
  });

  const combined = data ? data.daily.map((d, i) => ({ day: d.day, local: d.price, regional: data.regional_avg[i]?.price })) : [];
  const trend = data ? (data.price_after_15_days > price * 1.03 ? "Increasing" : data.price_after_15_days < price * 0.97 ? "Decreasing" : "Stable") : "Stable";
  const TrendIcon = trend === "Increasing" ? ArrowUpRight : trend === "Decreasing" ? ArrowDownRight : ArrowRight;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Market intelligence</h1>
        <p className="mt-1 text-sm text-muted-foreground">15-day mandi price forecast (XGBoost). Intraday curve interpolated for visualization.</p>
      </div>

      <Card className="p-6">
        <div className="grid gap-3 md:grid-cols-4">
          <div><Label>Crop</Label>
            <Select value={crop} onValueChange={(v) => { setCrop(v as CropName); setPrice(CROP_BASE_PRICE_PER_QUINTAL[v as CropName]); }}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{CROPS.filter(c => c.priceModel).map(c => <SelectItem key={c.name} value={c.name}>{c.emoji} {c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>State</Label>
            <Select value={state} onValueChange={(v) => { setState(v); setDistrict(STATE_DISTRICTS[v][0]); }}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>District</Label>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{STATE_DISTRICTS[state].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Today's price (₹/qtl)</Label>
            <Input type="number" className="mt-1" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
        </div>
        <Button className="mt-4 gradient-primary text-primary-foreground" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Loading…" : "Update forecast"}
        </Button>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Today", value: price },
          { label: "Day 5", value: data?.daily[5]?.price },
          { label: "Day 8", value: data?.daily[8]?.price },
          { label: "Day 15", value: data?.price_after_15_days },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-bold">₹{s.value ?? "—"}<span className="text-sm font-medium text-muted-foreground">/qtl</span></p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Forecast curve</h3>
          <span className={cn("flex items-center gap-1 text-sm font-semibold",
            trend === "Increasing" ? "text-success" : trend === "Decreasing" ? "text-destructive" : "text-muted-foreground"
          )}><TrendIcon className="h-4 w-4" /> {trend}</span>
        </div>
        <div className="mt-4 h-72">
          <ResponsiveContainer>
            <AreaChart data={data?.daily ?? []}>
              <defs><linearGradient id="mc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} /><stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="day" tickFormatter={(v) => `D${v}`} axisLine={false} tickLine={false} />
              <YAxis width={60} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} formatter={(v: number) => [`₹${v}/qtl`, "Price"]} />
              <Area type="monotone" dataKey="price" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#mc)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold">Local vs regional average</h3>
        <p className="text-xs text-muted-foreground">Illustrative regional benchmark for context.</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer>
            <LineChart data={combined}>
              <XAxis dataKey="day" tickFormatter={(v) => `D${v}`} axisLine={false} tickLine={false} />
              <YAxis width={60} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
              <Legend />
              <Line type="monotone" dataKey="local" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} name={`${district} mandi`} />
              <Line type="monotone" dataKey="regional" stroke="var(--color-accent)" strokeWidth={2.5} dot={false} name={`${state} avg`} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
