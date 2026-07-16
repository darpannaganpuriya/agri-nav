import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { toast } from "sonner";

export function StorageProfile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [companyName, setCompanyName] = useState(user?.company_name || "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await authService.updateProfile(name, phone, companyName);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your storage owner profile and account details.</p>
      </div>
      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div><Label>Name</Label><Input className="mt-1" placeholder="Owner name" value={name} onChange={e => setName(e.target.value)} /></div>
          <div><Label>Phone</Label><Input className="mt-1" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} /></div>
          <div><Label>Email</Label><Input className="mt-1" placeholder="Email" value={user?.email} disabled /></div>
          <div><Label>Company</Label><Input className="mt-1" placeholder="Storage company" value={companyName} onChange={e => setCompanyName(e.target.value)} /></div>
        </div>
        <div className="mt-6"><Button onClick={handleSave} disabled={loading} className="gradient-primary text-primary-foreground">{loading ? "Saving..." : "Save changes"}</Button></div>
      </Card>
    </div>
  );
}
