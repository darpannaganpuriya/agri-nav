import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { storageService } from "@/services/storageService";
import { useAuth } from "@/contexts/AuthContext";
import { formatINR } from "@/utils/format";
import { ArrowLeft, Package, Calendar, Phone, Mail, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import type { Booking } from "@/types";
import { Badge } from "@/components/ui/badge";

export function BookingDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const fetcher = user?.role === "farmer" ? storageService.getFarmerBookings : storageService.getOwnerBookings;
        const bookings = await fetcher();
        const found = bookings.find((b: any) => b.id === id);
        if (found) setBooking(found);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBooking();
  }, [id, user]);

  const handleUpdateStatus = async (status: Booking["status"]) => {
    try {
      const updated = await storageService.updateBookingStatus(id!, status);
      if (updated) {
        setBooking(updated);
        toast.success(`Booking status updated to ${status}`);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Failed to update booking status");
    }
  };

  if (isLoading) {
    return <div className="p-8 space-y-4 max-w-3xl mx-auto"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold">Booking not found</h2>
        <Button asChild className="mt-4"><Link to={user?.role === "farmer" ? "/dashboard" : "/storage/dashboard"}>Go Back</Link></Button>
      </div>
    );
  }

  const isOwner = user?.role === "storage_owner";

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon"><Link to={isOwner ? "/storage/dashboard" : "/dashboard"}><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Booking Details</h1>
          <p className="text-sm text-muted-foreground">ID: {booking.id}</p>
        </div>
        <Badge className={`ml-auto ${booking.status === 'Pending' ? 'bg-amber-100 text-amber-700' : booking.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {booking.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Storage Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-md"><Package className="h-5 w-5 text-muted-foreground" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Crop & Quantity</p>
                <p className="font-semibold">{booking.crop} - {booking.quantity_kg} kg</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-md"><Calendar className="h-5 w-5 text-muted-foreground" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Arrival & Duration</p>
                <p className="font-semibold">{booking.arrival_date ? new Date(booking.arrival_date).toLocaleDateString() : 'N/A'} for {booking.duration_days} days</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-md"><Clock className="h-5 w-5 text-muted-foreground" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Booking Created</p>
                <p className="font-semibold">{new Date(booking.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-center justify-between">
            <span className="font-semibold">Estimated Cost</span>
            <span className="text-xl font-bold text-primary">{formatINR(booking.estimated_cost)}</span>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">{isOwner ? "Farmer Details" : "Storage Owner Details"}</h2>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Contact information will be available here if the user added it to their profile. (Mocked for now)</p>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-md"><Phone className="h-5 w-5 text-muted-foreground" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-semibold">+91 XXXXX XXXXX</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-md"><Mail className="h-5 w-5 text-muted-foreground" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">{isOwner ? (booking.farmer_name || 'farmer').toLowerCase().replace(' ', '.') + '@gmail.com' : 'contact@storage.com'}</p>
              </div>
            </div>
          </div>

          {isOwner && booking.status === "Pending" && (
            <div className="mt-8 flex gap-3">
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleUpdateStatus("Accepted")}>
                <CheckCircle className="mr-2 h-4 w-4" /> Accept
              </Button>
              <Button className="flex-1" variant="destructive" onClick={() => handleUpdateStatus("Rejected")}>
                <XCircle className="mr-2 h-4 w-4" /> Reject
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
