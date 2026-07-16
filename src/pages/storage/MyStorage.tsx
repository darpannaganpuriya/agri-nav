import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { storageService } from "@/services/storageService";
import type { StorageFacility } from "@/types";
import { Edit3, Package, ShieldCheck, Thermometer, Droplets, MapPin, Trash2, Pause, Play } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function StorageMyStorage() {
  const { user } = useAuth();
  const [storage, setStorage] = useState<StorageFacility[]>([]);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [editingCapacityId, setEditingCapacityId] = useState<string | null>(null);
  const [newCapacity, setNewCapacity] = useState<number>(0);
  
  const [editingPricingId, setEditingPricingId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);

  const fetchStorage = () => {
    storageService.getStorageByOwner(user?.id).then((data) => setStorage(data));
  };

  useEffect(() => {
    fetchStorage();
  }, [user?.id]);

  async function handleUpdateCapacity(id: string) {
    try {
      setLoading(true);
      await storageService.updateStorage(id, { available_capacity_kg: newCapacity * 1000 });
      toast.success("Capacity updated");
      setEditingCapacityId(null);
      fetchStorage();
    } catch (e: any) {
      toast.error(e.message || "Failed to update capacity");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePricing(id: string) {
    try {
      setLoading(true);
      await storageService.updateStorage(id, { cost_per_kg_day: newPrice });
      toast.success("Pricing updated");
      setEditingPricingId(null);
      fetchStorage();
    } catch (e: any) {
      toast.error(e.message || "Failed to update pricing");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(id: string, currentStatus?: string) {
    try {
      const newStatus = currentStatus === "Paused" ? "Active" : "Paused";
      await storageService.updateStorage(id, { status: newStatus });
      toast.success(`Listing ${newStatus === "Paused" ? "paused" : "activated"}`);
      fetchStorage();
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    }
  }

  async function handleDelete(id: string) {
    try {
      await storageService.deleteStorage(id);
      toast.success("Listing deleted");
      fetchStorage();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete listing");
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Storage</h1>
        <p className="mt-1 text-sm text-muted-foreground">View and manage your registered cold storage facility.</p>
      </div>
      {storage.length === 0 ? (
        <Card className="p-8 text-sm text-muted-foreground">No storage registered yet.</Card>
      ) : storage.map((facility) => (
        <Card key={facility.id} className="overflow-hidden p-0 relative">
          {facility.status === "Paused" && (
            <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center backdrop-blur-sm pointer-events-none">
              <Badge variant="destructive" className="text-lg px-4 py-1">PAUSED</Badge>
            </div>
          )}
          <img src={facility.image} alt="" className="h-48 w-full object-cover" />
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{facility.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground"><MapPin className="mr-1 inline h-4 w-4" />{facility.address}</p>
              </div>
              <Badge className="border-primary/20 bg-primary/10 text-primary">{facility.verification_status ?? "Pending"}</Badge>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="mt-2 font-semibold">{facility.available_tons}/{facility.capacity_tons} tons free</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="text-sm text-muted-foreground">Storage Cost</p>
                <p className="mt-2 font-semibold">₹{facility.cost_per_kg_day}/kg/day</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="text-sm text-muted-foreground">Supported Crops</p>
                <p className="mt-2 text-sm">{facility.compatible_crops.slice(0, 4).join(", ")}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm"><Thermometer className="h-4 w-4" /> {facility.temperature_range ?? "N/A"}</div>
              <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm"><Droplets className="h-4 w-4" /> {facility.humidity_range ?? "N/A"}</div>
              <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm"><ShieldCheck className="h-4 w-4" /> {facility.facilities?.join(", ") || "Basic"}</div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 relative z-20">
              
              <Dialog open={editingCapacityId === facility.id} onOpenChange={(o) => {
                if (o) {
                  setNewCapacity(facility.available_tons);
                  setEditingCapacityId(facility.id);
                } else setEditingCapacityId(null);
              }}>
                <DialogTrigger asChild><Button variant="outline"><Package className="mr-2 h-4 w-4" /> Update Capacity</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Update Available Capacity</DialogTitle></DialogHeader>
                  <div className="py-4">
                    <Label>Available Capacity (Tons)</Label>
                    <Input type="number" min={0} max={facility.capacity_tons} value={newCapacity} onChange={(e) => setNewCapacity(Number(e.target.value))} className="mt-2" />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingCapacityId(null)}>Cancel</Button>
                    <Button onClick={() => handleUpdateCapacity(facility.id)} disabled={loading}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={editingPricingId === facility.id} onOpenChange={(o) => {
                if (o) {
                  setNewPrice(facility.cost_per_kg_day);
                  setEditingPricingId(facility.id);
                } else setEditingPricingId(null);
              }}>
                <DialogTrigger asChild><Button variant="outline"><Package className="mr-2 h-4 w-4" /> Update Pricing</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Update Pricing</DialogTitle></DialogHeader>
                  <div className="py-4">
                    <Label>Cost per kg/day (₹)</Label>
                    <Input type="number" step={0.01} min={0} value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} className="mt-2" />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingPricingId(null)}>Cancel</Button>
                    <Button onClick={() => handleUpdatePricing(facility.id)} disabled={loading}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={() => handleToggleStatus(facility.id, facility.status)}>
                {facility.status === "Paused" ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                {facility.status === "Paused" ? "Resume Listing" : "Pause Listing"}
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your storage facility listing from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(facility.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
