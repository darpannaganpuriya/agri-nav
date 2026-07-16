import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Leaf } from "lucide-react";
import droneImg from "@/assets/drone-fields.jpg";
import { cn } from "@/lib/utils";

export function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"farmer" | "storage_owner">("farmer");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { setUser } = useAuth();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (!name.trim()) { toast.error("Enter your name"); return; }
      if (!email.trim()) { toast.error("Enter your email"); return; }
      if (!password.trim()) { toast.error("Enter a password"); return; }
      if (!/^\d{10}$/.test(phone)) { toast.error("Enter a 10-digit phone"); return; }
      const user = await authService.signup(name, email, password, phone, role);
      if (!user) { toast.error("Signup failed"); return; }
      setUser(user);
      toast.success("Account created");
      nav(user.role === "storage_owner" ? (user.hasStorage ? "/storage/dashboard" : "/storage/onboarding") : "/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl gradient-primary">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="text-lg font-bold">FasalSeva AI</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Use email and password to sign up and log in later.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-2"><Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ramesh Patel" />
            </div>
            <div className="space-y-2"><Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-2"><Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create password" />
            </div>
            <div className="space-y-2"><Label>Phone</Label>
              <div className="flex">
                <span className="grid place-items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">+91</span>
                <Input className="rounded-l-none" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="9876543210" />
              </div>
            </div>
            <div className="space-y-2"><Label>I am a</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["farmer","storage_owner"] as const).map((r) => (
                  <button type="button" key={r} onClick={() => setRole(r)}
                    className={cn(
                      "rounded-lg border p-3 text-left text-sm transition-all",
                      role === r ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50",
                    )}>
                    <span className="font-semibold capitalize">{r.replace("_"," ")}</span>
                    <p className="mt-0.5 text-xs text-muted-foreground">{r === "farmer" ? "I grow & sell crops" : "I run a cold storage"}</p>
                  </button>
                ))}
              </div>
            </div>
            <Button disabled={loading} className="w-full gradient-primary text-primary-foreground">
              {loading ? "…" : "Create account"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link>
          </p>
        </div>
      </div>
      <div className="hidden md:block">
        <img src={droneImg} alt="" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
