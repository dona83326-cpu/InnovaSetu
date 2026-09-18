import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Landmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Role } from "@/lib/session";
import { DISTRICTS, GOV_DEPARTMENTS, UNIVERSITY_TYPES, INDUSTRY_SECTORS } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — SICP Jharkhand" },
      {
        name: "description",
        content:
          "Create an account as a citizen, officer, university coordinator or administrator.",
      },
      { property: "og:title", content: "Register — SICP Jharkhand" },
      {
        property: "og:description",
        content: "Create an account on the Societal Innovation Collaboration Portal.",
      },
    ],
  }),
  component: RegisterPage,
});

const roleOptions: { value: Role; label: string; desc: string }[] = [
  {
    value: "citizen",
    label: "Citizen",
    desc: "Report challenges in your locality and track progress.",
  },
  {
    value: "gov",
    label: "Government Officer",
    desc: "Review submissions and assign them to universities.",
  },
  {
    value: "university",
    label: "University Admin",
    desc: "Receive assignments and manage solution projects.",
  },
  {
    value: "industry",
    label: "Industry Representative",
    desc: "Bid on approved tenders and deliver solutions on the ground.",
  },
];

type RegErrors = Partial<{
  name: string;
  email: string;
  phone: string;
  password: string;
  org: string;
  universityType: string;
  company: string;
  sector: string;
  department: string;
  district: string;
  terms: string;
  consent: string;
  form: string;
}>;

function safeRegistrationError(
  error: { code?: string | undefined; message?: string | undefined } | null,
) {
  return error?.message || "We could not create your account. Please try again.";
}

function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("citizen");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    org: "",
    universityType: "",
    company: "",
    sector: "",
    department: "",
    district: "",
  });
  const [terms, setTerms] = useState(false);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<RegErrors>({});
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const next: RegErrors = {};
    if (!form.name.trim()) next.name = "Full name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address";
    if (!/^\d{10}$/.test(form.phone)) next.phone = "Enter a 10-digit mobile number";
    if (form.password.length < 6) next.password = "Password must be at least 6 characters";
    if (role === "university" && !form.org.trim()) next.org = "Organization name is required";
    if (role === "university" && !form.universityType)
      next.universityType = "Select a university type";
    if (role === "industry" && !form.company.trim()) next.company = "Company name is required";
    if (role === "industry" && !form.sector) next.sector = "Select an industry sector";
    if (role === "gov" && !form.department) next.department = "Select a department";
    if (role === "gov" && !form.district) next.district = "Select a district";
    if (!terms) next.terms = "Please accept the terms to continue";
    if (!consent) next.consent = "This consent is mandatory to register";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          full_name: form.name.trim(),
          role,
          phone: form.phone,
          department: form.department,
          district: form.district,
          organization_name: form.org || form.company || form.department,
          university_type: form.universityType,
          sector: form.sector,
        },
      },
    });

    if (signUpError || !data.user) {
      setErrors({ form: safeRegistrationError(signUpError) });
      setLoading(false);
      return;
    }

    if (data.session) await supabase.auth.signOut();
    sessionStorage.setItem(
      "sicp-registration-message",
      "Account created successfully. Please log in with your registered email and password.",
    );
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Landmark className="size-5" />
          </span>
          <span className="font-bold">SICP Jharkhand</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-9">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registration is free and takes less than a minute.
          </p>
          {errors.form && <p className="mt-4 text-sm text-destructive">{errors.form}</p>}

          <form onSubmit={submit} className="mt-8 space-y-6" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Anjali Mahto"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile number</Label>
                <Input
                  id="phone"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="10-digit number"
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Minimum 6 characters"
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Register as</Label>
              <RadioGroup
                value={role}
                onValueChange={(v) => setRole(v as Role)}
                className="grid gap-3 sm:grid-cols-2"
              >
                {roleOptions.map((o) => (
                  <label
                    key={o.value}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ${
                      role === o.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    <RadioGroupItem value={o.value} className="mt-0.5" />
                    <span>
                      <span className="block text-sm font-semibold">{o.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{o.desc}</span>
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {role === "university" && (
              <div className="grid gap-4 rounded-xl border border-border bg-secondary/50 p-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="org">Organization name</Label>
                  <Input
                    id="org"
                    value={form.org}
                    onChange={(e) => set("org", e.target.value)}
                    placeholder="e.g. BIT Sindri, Dhanbad"
                  />
                  {errors.org && <p className="text-xs text-destructive">{errors.org}</p>}
                </div>
                <div className="space-y-2">
                  <Label>University type</Label>
                  <Select
                    value={form.universityType}
                    onValueChange={(v) => set("universityType", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIVERSITY_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.universityType && (
                    <p className="text-xs text-destructive">{errors.universityType}</p>
                  )}
                </div>
              </div>
            )}

            {role === "industry" && (
              <div className="grid gap-4 rounded-xl border border-border bg-secondary/50 p-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company">Company name</Label>
                  <Input
                    id="company"
                    value={form.company}
                    onChange={(e) => set("company", e.target.value)}
                    placeholder="e.g. Aqua Terra Systems Pvt Ltd"
                  />
                  {errors.company && <p className="text-xs text-destructive">{errors.company}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Industry sector</Label>
                  <Select value={form.sector} onValueChange={(v) => set("sector", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRY_SECTORS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.sector && <p className="text-xs text-destructive">{errors.sector}</p>}
                </div>
              </div>
            )}

            {role === "gov" && (
              <div className="grid gap-4 rounded-xl border border-border bg-secondary/50 p-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={form.department} onValueChange={(v) => set("department", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOV_DEPARTMENTS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department && (
                    <p className="text-xs text-destructive">{errors.department}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>District</Label>
                  <Select value={form.district} onValueChange={(v) => set("district", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISTRICTS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.district && <p className="text-xs text-destructive">{errors.district}</p>}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="flex items-start gap-3 text-sm">
                <Checkbox
                  checked={terms}
                  onCheckedChange={(v) => setTerms(v === true)}
                  className="mt-0.5"
                />
                <span className="text-muted-foreground">
                  I agree to the terms of use and consent to my report being shared with partner
                  institutions of the Government of Jharkhand.
                </span>
              </label>
              {errors.terms && <p className="text-xs text-destructive">{errors.terms}</p>}
              <label className="flex items-start gap-3 text-sm">
                <Checkbox
                  checked={consent}
                  onCheckedChange={(v) => setConsent(v === true)}
                  className="mt-0.5"
                />
                <span className="text-muted-foreground">
                  I agree to share information with partner institutions.
                </span>
              </label>
              {errors.consent && <p className="text-xs text-destructive">{errors.consent}</p>}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
