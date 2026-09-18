import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Landmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { saveSession, roleHome, type Role } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — InnovaSetu" },
      { name: "description", content: "Sign in to InnovaSetu - Collaborative Civic Innovation Platform." },
      { property: "og:title", content: "Login — InnovaSetu" },
      {
        property: "og:description",
        content: "Sign in to InnovaSetu - Collaborative Civic Innovation Platform.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("citizen");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [registrationMessage, setRegistrationMessage] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const message = sessionStorage.getItem("sicp-registration-message");
    if (message) {
      setRegistrationMessage(message);
      sessionStorage.removeItem("sicp-registration-message");
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setNeedsConfirmation(false);
    setResendMessage(null);
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address";
    if (!password) next.password = "Password is required";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.user) {
      const errorMessage = error?.message.toLowerCase() ?? "";
      let message = "Incorrect email or password.";
      if (
        error?.code === "email_not_confirmed" ||
        errorMessage.includes("email not confirmed") ||
        errorMessage.includes("confirm your email")
      ) {
        message = "Please confirm your email before logging in.";
        setNeedsConfirmation(true);
      } else if (
        error?.code === "user_not_found" ||
        errorMessage.includes("user not found") ||
        errorMessage.includes("email not found")
      ) {
        message = "Account not registered. Please create an account first.";
      }
      setErrors({ email: message });
      setLoading(false);
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      await supabase.auth.signOut();
      setErrors({
        email: "Your account was created, but your profile could not be loaded. Please contact support.",
      });
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email, role")
      .eq("id", user.id)
      .maybeSingle();
    
    const profileRole = profile?.role as Role;

    // 🔍 DEBUG LOGS ADDED HERE 🔍
    console.log("=== LOGIN DEBUG ===");
    console.log("1. Profile Data from DB:", profile);
    console.log("2. Profile Role:", profileRole);
    console.log("3. Selected Role on Form:", selectedRole);
    console.log("4. Is Role Valid?", profileRole in roleHome);

    if (profileError || !profile || !profile.full_name?.trim() || !(profileRole in roleHome)) {
      await supabase.auth.signOut();
      setErrors({
        email: "Your account was created, but your profile could not be loaded or has an invalid role. Please contact support.",
      });
      setLoading(false);
      return;
    }

    if (selectedRole !== profileRole) {
      await supabase.auth.signOut();
      setErrors({ email: `The selected role (${selectedRole}) does not match your account profile (${profileRole}).` });
      setLoading(false);
      return;
    }

    console.log("5. Saving Session and Navigating to:", roleHome[profileRole]);
    
    saveSession({
      name: profile.full_name.trim(),
      email: profile.email || email.trim(),
      role: profileRole,
    });
    
    navigate({ to: roleHome[profileRole] });
  };

  const resendConfirmation = async () => {
    if (resendLoading) return;
    setResendLoading(true);
    setResendMessage(null);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setResendMessage(error ? error.message : "Confirmation email resent. Please check your inbox.");
    setResendLoading(false);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* LEFT PANEL - BRANDING */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="pointer-events-none absolute -right-20 top-10 size-80 rounded-full bg-accent/25 blur-3xl" />
        <Link to="/" className="relative flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
            <Landmark className="size-5" />
          </span>
          <div>
            <span className="block text-lg font-bold">InnovaSetu</span>
            <span className="block text-xs text-primary-foreground/70">Collaborative Civic Innovation</span>
          </div>
        </Link>
        <div className="relative">
          <h2 className="max-w-md text-4xl font-bold leading-tight">
            Turn Local Problems Into Real Solutions
          </h2>
          <p className="mt-4 max-w-sm opacity-85">
            Citizens report problems, universities propose solutions, industry executes approved
            work, and Government verifies the outcome.
          </p>
        </div>
        <p className="relative text-xs opacity-70">
          © {new Date().getFullYear()} Government of Jharkhand · InnovaSetu
        </p>
      </div>

      {/* RIGHT PANEL - LOGIN FORM */}
      <div className="flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
          <Link to="/" className="mb-6 flex items-center gap-2 lg:hidden">
            <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Landmark className="size-4.5" />
            </span>
            <div>
              <span className="block font-bold text-sm">InnovaSetu</span>
              <span className="block text-[10px] text-muted-foreground">Collaborative Civic Innovation</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to continue</p>
          {registrationMessage && (
            <p className="mt-4 text-sm text-success">{registrationMessage}</p>
          )}

          <form onSubmit={submit} className="mt-7 space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              {needsConfirmation && (
                <div className="space-y-1">
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-xs"
                    onClick={resendConfirmation}
                    disabled={resendLoading || !email.trim()}
                  >
                    {resendLoading ? "Resending…" : "Resend confirmation email"}
                  </Button>
                  {resendMessage && (
                    <p
                      className={`text-xs ${resendMessage.startsWith("Confirmation email") ? "text-success" : "text-destructive"}`}
                    >
                      {resendMessage}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <div className="space-y-3">
              <Label>I am a:</Label>
              <RadioGroup
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as Role)}
                className="grid gap-2 sm:grid-cols-2"
              >
                {[
                  ["citizen", "Citizen"],
                  ["gov", "Government Officer"],
                  ["university", "University"],
                  ["industry", "Industry"],
                ].map(([value, label]) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 text-sm hover:bg-secondary transition-colors"
                  >
                    <RadioGroupItem value={value as Role} />
                    <span>{label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {loading ? "Signing in…" : "Login"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}