import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { User, Phone, Save, BarChart2, Bell, Shield, MapPin, Settings as SettingsIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { analysisService } from "@/services/analysisService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalAnalyses: 0, savedReports: 0 });

  useEffect(() => {
    const history = analysisService.getHistory();
    setStats({
      totalAnalyses: history.length,
      savedReports: history.length > 0 ? Math.floor(history.length * 0.7) : 0, // mockup for saved
    });
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">Farmer Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account, view activity, and update settings.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card className="p-6 border-emerald-500/20 shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><User className="h-5 w-5 text-emerald-600" /> Personal Details</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" defaultValue={user?.name} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" defaultValue={user?.phone} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" defaultValue="Maharashtra" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9 bg-muted" disabled defaultValue={user?.role === "farmer" ? "Farmer" : user?.role} />
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => toast.success("Profile updated successfully")}>Save Changes</Button>
            </div>
          </Card>

          <Card className="p-6 border-sky-500/20 shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><SettingsIcon className="h-5 w-5 text-sky-600" /> Preferences</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-semibold">App Language</p>
                  <p className="text-sm text-muted-foreground">Select your preferred language.</p>
                </div>
                <Select defaultValue="en">
                  <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी</SelectItem>
                    <SelectItem value="mr">मराठी</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Toggle dark theme appearance.</p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 border-purple-500/20 bg-purple-500/5 shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-purple-700 dark:text-purple-400"><BarChart2 className="h-5 w-5" /> Activity Stats</h2>
            <div className="space-y-4">
              <div className="bg-background rounded-xl p-4 border flex items-center gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg text-purple-600"><BarChart2 className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Analyses</p>
                  <p className="text-2xl font-black">{stats.totalAnalyses}</p>
                </div>
              </div>
              <div className="bg-background rounded-xl p-4 border flex items-center gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg text-emerald-600"><Save className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Saved Reports</p>
                  <p className="text-2xl font-black">{stats.savedReports}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function Settings() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage how and when you receive alerts.</p>
      </div>
      <Card className="p-6 space-y-6 shadow-sm">
        <SettingRow icon={Bell} title="SMS alerts" desc="Get shelf-life warnings via SMS." defaultOn />
        <SettingRow icon={BarChart2} title="Price movement alerts" desc="When forecast changes by more than 10%." defaultOn />
        <SettingRow icon={Save} title="Marketing emails" desc="Occasional product updates and feature announcements." />
      </Card>
    </div>
  );
}

function SettingRow({ title, desc, defaultOn, icon: Icon }: { title: string; desc: string; defaultOn?: boolean; icon: any }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-6 last:border-0 last:pb-0">
      <div className="flex items-start gap-3">
        <div className="mt-1 bg-muted p-2 rounded-lg text-muted-foreground"><Icon className="h-4 w-4" /></div>
        <div>
          <p className="font-semibold text-base">{title}</p>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
      <Switch defaultChecked={defaultOn} />
    </div>
  );
}
