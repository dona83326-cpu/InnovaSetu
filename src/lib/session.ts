export type Role = "citizen" | "gov" | "university" | "industry" | "admin";

export interface Session {
  name: string;
  email: string;
  role: Role;
  org?: string;
}

const KEY = "sicp-session";

export const roleLabels: Record<Role, string> = {
  citizen: "Citizen",
  gov: "Government Officer",
  university: "University Admin",
  industry: "Industry Representative",
  admin: "Administrator",
};

// ✅ FIXED: Changed to "/gov/dashboard" to match your actual file names!
export const roleHome: Record<Role, string> = {
  citizen: "/citizen/dashboard",
  gov: "/gov/dashboard", 
  university: "/university/dashboard",
  industry: "/industry/dashboard",
  admin: "/admin/dashboard",
};

export function saveSession(s: Session) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(s));
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}