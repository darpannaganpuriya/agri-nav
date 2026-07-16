import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { authService } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Leaf } from "lucide-react";
import heroImg from "@/assets/hero-farmer.jpg";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"farmer" | "storage_owner">("farmer");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { setUser } = useAuth();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (!email.trim()) { toast.error("Enter your email"); return; }
      if (!password.trim()) { toast.error("Enter your password"); return; }
      const result = await authService.login(email, password, role);
      const user = result?.user;
      if (!user) { toast.error("Login failed"); return; }
      setUser(user);
      toast.success("Welcome back");
      nav(user.role === "storage_owner" ? (user.hasStorage ? "/storage/dashboard" : "/storage/onboarding") : "/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden md:block">
        <img src={heroImg} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl gradient-primary">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="text-lg font-bold">FasalSeva AI</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Log in with your email and password to continue.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label>I am a</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["farmer", "storage_owner"] as const).map((r) => (
                  <button type="button" key={r} onClick={() => setRole(r)}
                    className={`rounded-lg border p-3 text-left text-sm transition-all ${
                      role === r ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                    }`}>
                    <span className="font-semibold capitalize">{r.replace("_", " ")}</span>
                    <p className="mt-0.5 text-xs text-muted-foreground">{r === "farmer" ? "I grow & sell crops" : "I run a cold storage"}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground">
              {loading ? "…" : "Log in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here? <Link to="/signup" className="font-semibold text-primary hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
