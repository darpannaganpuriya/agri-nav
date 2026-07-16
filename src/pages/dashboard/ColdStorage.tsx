import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { storageService } from "@/services/storageService";
import type { CropName, StorageFacility } from "@/types";
import { CROPS } from "@/constants/data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, MapPin, IndianRupee, Package, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const StorageMap = lazy(() => import("./StorageMap"));

function ClientMap({ facilities }: { facilities?: StorageFacility[] }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  if (!isClient) return <Skeleton className="h-full w-full" />;
  return (
    <Suspense fallback={<Skeleton className="h-full w-full" />}>
      <StorageMap facilities={facilities} />
    </Suspense>
  );
}

export function ColdStorage() {
  const [crop, setCrop] = useState<CropName | "all">("all");
  const [maxDistance, setMaxDistance] = useState(20);

  const { data: facilities, isLoading } = useQuery({
    queryKey: ["facilities", crop, maxDistance],
    queryFn: () => storageService.getFacilities({ crop: crop === "all" ? undefined : crop, maxDistance }),
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cold storage near you</h1>
        <p className="mt-1 text-sm text-muted-foreground">Live availability, crop compatibility, and 1-click booking.</p>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div><Label>Crop compatibility</Label>
            <Select value={crop} onValueChange={(v) => setCrop(v as CropName | "all")}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any crop</SelectItem>
                {CROPS.map(c => <SelectItem key={c.name} value={c.name}>{c.emoji} {c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Max distance: {maxDistance} km</Label>
            <Slider className="mt-3" min={2} max={30} step={1} value={[maxDistance]} onValueChange={(v) => setMaxDistance(v[0])} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="h-[420px] overflow-hidden lg:col-span-3" style={{ isolation: "isolate" }}>
          <ClientMap facilities={facilities} />
        </Card>

        <div className="space-y-3 lg:col-span-2">
          {isLoading ? [1,2,3].map(i => <Skeleton key={i} className="h-40" />) :
            facilities?.length === 0 ? (
              <Card className="p-8 text-center text-sm text-muted-foreground">No facilities match your filters.</Card>
            ) : facilities?.map(f => <FacilityCard key={f.id} f={f} />)}
        </div>
      </div>
    </div>
  );
}

function FacilityCard({ f }: { f: StorageFacility }) {
  return (
    <Card className="overflow-hidden">
      <img src={f.image} alt="" className="h-32 w-full object-cover" loading="lazy" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold">{f.name}</p>
            <p className="text-xs text-muted-foreground"><MapPin className="mr-1 inline h-3 w-3" />{f.distance_km} km · {f.address}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent-foreground">
            <Star className="h-3 w-3 fill-current" /> {f.rating}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div><Package className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />{f.available_tons}/{f.capacity_tons} tons free</div>
          <div><IndianRupee className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />₹{f.cost_per_kg_day}/kg/day</div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {f.compatible_crops.slice(0, 4).map(c => <span key={c} className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{c}</span>)}
          {f.compatible_crops.length > 4 && <span className="text-[10px] text-muted-foreground">+{f.compatible_crops.length - 4}</span>}
        </div>
        <div className="mt-4 flex gap-2">
          <DetailsDialog f={f} />
          <BookDialog f={f} />
        </div>
      </div>
    </Card>
  );
}

function DetailsDialog({ f }: { f: StorageFacility }) {
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="outline" size="sm" className="flex-1">Details</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{f.name}</DialogTitle></DialogHeader>
        <img src={f.image} alt="" className="h-40 w-full rounded-lg object-cover" />
        <div className="grid gap-2 text-sm">
          <p><MapPin className="mr-1 inline h-4 w-4 text-muted-foreground" />{f.address}</p>
          <p><Package className="mr-1 inline h-4 w-4 text-muted-foreground" />{f.available_tons} of {f.capacity_tons} tons available</p>
          <p><IndianRupee className="mr-1 inline h-4 w-4 text-muted-foreground" />₹{f.cost_per_kg_day} per kg per day</p>
          <div><p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Amenities</p>
            <div className="flex flex-wrap gap-1">{f.amenities.map(a => <span key={a} className="rounded-full bg-muted px-2 py-1 text-xs"><ShieldCheck className="mr-1 inline h-3 w-3" />{a}</span>)}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BookDialog({ f }: { f: StorageFacility }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(100);
  const [days, setDays] = useState(10);
  const [crop, setCrop] = useState<CropName>(f.compatible_crops[0]);

  const mutation = useMutation({
    mutationFn: () => storageService.bookStorage({ facility_id: f.id, crop, quantity_kg: qty, duration_days: days }),
    onSuccess: (b) => {
      toast.success(`Booking confirmed · ${b.facility_name}`, { description: `Estimated cost ${new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(b.estimated_cost)}` });
      qc.invalidateQueries({ queryKey: ["bookings"] });
      setOpen(false);
    },
  });
  const estimate = useMemo(() => Math.round(qty * f.cost_per_kg_day * days), [qty, days, f.cost_per_kg_day]);
  const overCap = f.available_tons * 1000 < qty;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex-1 gradient-primary text-primary-foreground" disabled={f.available_tons === 0}>
          {f.available_tons === 0 ? "Full" : "Book"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Book {f.name}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div><Label>Crop</Label>
            <Select value={crop} onValueChange={(v) => setCrop(v as CropName)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{f.compatible_crops.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Quantity (kg)</Label><Input type="number" className="mt-1" value={qty} onChange={e => setQty(Number(e.target.value))} /></div>
            <div><Label>Duration (days)</Label><Input type="number" className="mt-1" value={days} onChange={e => setDays(Number(e.target.value))} /></div>
          </div>
          {overCap && <p className="text-xs text-destructive">Quantity exceeds available capacity.</p>}
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p>Estimated cost <b className="float-right">{new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(estimate)}</b></p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || overCap} className="gradient-primary text-primary-foreground">
            {mutation.isPending ? "Booking…" : "Confirm booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
