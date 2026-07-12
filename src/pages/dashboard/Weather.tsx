import { useQuery } from "@tanstack/react-query";
import { weatherService } from "@/services/weatherService";
import { Card } from "@/components/ui/card";
import { Thermometer, Droplets, CloudRain, Sun, ShieldAlert } from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import { Skeleton } from "@/components/ui/skeleton";

export function Weather() {
  const { data, isLoading } = useQuery({ queryKey: ["weather","Indore"], queryFn: () => weatherService.getWeather("Indore, Madhya Pradesh") });

  const tiles = data ? [
    { icon: Thermometer, label: "Temperature", value: `${data.temperature}°C`, tone: "primary" as const },
    { icon: Droplets,    label: "Humidity",    value: `${data.humidity}%` },
    { icon: CloudRain,   label: "Rain (48h)",  value: `${data.rain_next_48h_mm} mm` },
    { icon: Sun,         label: "Heatwave risk", value: data.heatwave_risk },
    { icon: ShieldAlert, label: "Spoilage alert", value: data.spoilage_alert, badge: true },
  ] : [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Weather intelligence</h1>
        <p className="mt-1 text-sm text-muted-foreground">Conditions that affect your crop's shelf life today and tomorrow.</p>
      </div>

      {isLoading ? <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map(t => (
            <Card key={t.label} className="p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <t.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{t.label}</p>
                  {t.badge ? <RiskBadge risk={t.value} className="mt-1" /> : <p className="mt-0.5 text-2xl font-bold">{t.value}</p>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {data && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold">Forecast summary</h3>
          <p className="mt-2 text-sm text-muted-foreground">{data.forecast_summary}</p>
        </Card>
      )}
    </div>
  );
}
