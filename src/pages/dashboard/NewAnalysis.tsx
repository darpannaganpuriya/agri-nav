import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CROPS, STATES, STATE_DISTRICTS } from "@/constants/data";
import { analysisService } from "@/services/analysisService";
import { CROP_BASE_PRICE_PER_QUINTAL } from "@/services/marketService";
import type { AnalysisInput, CropName } from "@/types";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const schema = z.object({
  crop: z.string().min(1, "Choose a crop"),
  quantity_kg: z.number().positive("Quantity must be > 0"),
  harvest_date: z.string().min(1, "Pick a date"),
  state: z.string().min(1, "Choose a state"),
  district: z.string().min(1, "Choose a district"),
  current_price: z.number().positive("Enter today's mandi price"),
  temperature: z.number().min(0).max(45),
  humidity: z.number().min(40).max(100),
});
type FormData = z.infer<typeof schema>;

export function NewAnalysis() {
  const nav = useNavigate();
  const [state, setState] = useState<string>("");
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      crop: "", quantity_kg: 100, harvest_date: new Date().toISOString().slice(0, 10),
      state: "", district: "", current_price: 2200, temperature: 28, humidity: 65,
    },
  });
  const crop = watch("crop") as CropName | "";

  const mutation = useMutation({
    mutationFn: (input: AnalysisInput) => analysisService.runAnalysis(input),
    onSuccess: (res) => { toast.success("Analysis ready"); nav(`/dashboard/result/${res.id}`); },
    onError: () => toast.error("Something went wrong"),
  });

  const onSubmit = (v: FormData) => mutation.mutate(v as AnalysisInput);

  const currentPrice = watch("current_price");

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">New analysis</h1>
        <p className="mt-1 text-sm text-muted-foreground">Fill in the details below — takes about 30 seconds.</p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <Card className="p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Crop details</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <Label>Crop</Label>
              <Select onValueChange={(v) => { setValue("crop", v); if (CROP_BASE_PRICE_PER_QUINTAL[v as CropName]) setValue("current_price", CROP_BASE_PRICE_PER_QUINTAL[v as CropName]); }}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select crop" /></SelectTrigger>
                <SelectContent>
                  {CROPS.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      <span className="mr-2">{c.emoji}</span>{c.name}
                      {!c.priceModel && <span className="ml-2 text-[10px] text-muted-foreground">(shelf-life only)</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.crop && <p className="mt-1 text-xs text-destructive">{errors.crop.message}</p>}
            </div>
            <div>
              <Label>Quantity (kg)</Label>
              <Input className="mt-1" type="number" {...register("quantity_kg")} />
              {errors.quantity_kg && <p className="mt-1 text-xs text-destructive">{errors.quantity_kg.message}</p>}
            </div>
            <div>
              <Label>Harvest date</Label>
              <Input className="mt-1" type="date" {...register("harvest_date")} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Location</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <Label>State</Label>
              <Select onValueChange={(v) => { setValue("state", v); setState(v); setValue("district", ""); }}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>{STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              {errors.state && <p className="mt-1 text-xs text-destructive">{errors.state.message}</p>}
            </div>
            <div>
              <Label>District</Label>
              <Select onValueChange={(v) => setValue("district", v)} disabled={!state}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={state ? "Select district" : "Choose state first"} /></SelectTrigger>
                <SelectContent>{(STATE_DISTRICTS[state] ?? []).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
              {errors.district && <p className="mt-1 text-xs text-destructive">{errors.district.message}</p>}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Market input</h3>
          <div className="mt-4">
            <Label>Today's mandi price (₹ per quintal)</Label>
            <Input className="mt-1" type="number" {...register("current_price")} />
            <p className="mt-1 text-xs text-muted-foreground">≈ ₹{(Number(currentPrice) / 100).toFixed(2)}/kg</p>
            {errors.current_price && <p className="mt-1 text-xs text-destructive">{errors.current_price.message}</p>}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Sensor readings</h3>
          <p className="mt-1 text-xs text-muted-foreground">Can later be filled automatically from an IoT sensor at your storage site.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <Label>Temperature (°C) <span className="text-xs text-muted-foreground">— trained range 0-45</span></Label>
              <Input className="mt-1" type="number" step="0.1" {...register("temperature")} />
              {errors.temperature && <p className="mt-1 text-xs text-destructive">{errors.temperature.message}</p>}
            </div>
            <div>
              <Label>Humidity (%) <span className="text-xs text-muted-foreground">— trained range 40-100</span></Label>
              <Input className="mt-1" type="number" {...register("humidity")} />
              {errors.humidity && <p className="mt-1 text-xs text-destructive">{errors.humidity.message}</p>}
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={mutation.isPending} className="w-full gradient-primary text-primary-foreground md:w-auto">
            {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…</> : "Analyze crop"}
          </Button>
        </div>
      </form>
    </div>
  );
}
