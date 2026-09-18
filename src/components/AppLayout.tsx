import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ClipboardList,
  Compass,
  FilePlus2,
  LayoutDashboard,
  ListChecks,
  Landmark,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { getSession, clearSession, roleLabels, type Role, type Session } from "@/lib/session";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  hash?: string;
}

const navByRole: Record<Role, NavItem[]> = {
  citizen: [
    { label: "My Reports", to: "/citizen/dashboard", icon: LayoutDashboard },
    { label: "Report Problem", to: "/citizen/submit", icon: FilePlus2 },
  ],
  gov: [
    { label: "Dashboard", to: "/gov/dashboard", icon: LayoutDashboard },
  ],
  university: [
    { label: "Dashboard", to: "/university/dashboard", icon: LayoutDashboard },
    {
      label: "Available Challenges",
      to: "/university/available",
      icon: Compass,
    },
    {
      label: "My Proposals",
      to: "/university/proposals",
      icon: ClipboardList,
    },
    {
      label: "Active Projects",
      to: "/university/projects",
      icon: BriefcaseBusiness,
    },
    {
      label: "History",
      to: "/university/history",
      icon: ClipboardList,
    },
  ],
  industry: [
    { label: "Dashboard", to: "/industry/dashboard", icon: LayoutDashboard },
    {
      label: "Projects Open for Execution",
      to: "/industry/open-projects",
      icon: BriefcaseBusiness,
    },
    {
      label: "My Bids / Active Projects",
      to: "/industry/bids",
      icon: ListChecks,
    },
  ],
  admin: [
    { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Universities", to: "/admin/dashboard", icon: Building2 },
    { label: "Users", to: "/admin/dashboard", icon: Users },
  ],
};

const fallbackUsers: Record<Role, Session> = {
  citizen: { name: "Citizen", email: "", role: "citizen" },
  gov: {
    name: "R. K. Prasad",
    email: "rk.prasad@jharkhand.gov.in",
    role: "gov",
    org: "Urban Development",
  },
  university: {
    name: "Dr. S. Banerjee",
    email: "coordinator@bitsindri.ac.in",
    role: "university",
    org: "BIT Sindri, Dhanbad",
  },
  industry: {
    name: "Vikram Agarwal",
    email: "vikram@aquaterra.in",
    role: "industry",
    org: "Aqua Terra Systems Pvt Ltd",
  },
  admin: { name: "Admin Desk", email: "admin@innovasetu.in", role: "admin", org: "IT Cell" },
};

function NavList({
  items,
  pathname,
  collapsed,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1 px-3">
      {items.map((item, i) => {
        const active = pathname === item.to;
        return (
          <Link
            key={`${item.to}-${i}`}
            to={item.to}
            hash={item.hash}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
            title={item.label}
          >
            <item.icon className="size-4.5 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppLayout({
  role,
  title,
  subtitle,
  children,
}: {
  role: Role;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<Session>(fallbackUsers[role]);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      if (role !== "citizen") {
        const s = getSession();
        if (active) setUser(s && s.role === role ? s : fallbackUsers[role]);
        return;
      }

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) {
        if (active) setUser(fallbackUsers.citizen);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, role")
        .eq("id", authUser.id)
        .maybeSingle();

      if (active) {
        const profileRole = profile?.role as Role;
        setUser({
          name: profile?.full_name?.trim() || "Citizen",
          email: profile?.email || "",
          role: profileRole in roleLabels ? profileRole : "citizen",
        });
      }
    };

    void loadUser();
    return () => {
      active = false;
    };
  }, [role]);

  const items = navByRole[role];

  const logout = () => {
    clearSession();
    navigate({ to: "/" });
  };

  const brand = (
    <div className="flex items-center gap-2.5">
      {/* New InnovaSetu Logo */}
      <img src="/logo.png" alt="InnovaSetu Logo" className="h-10 w-auto rounded-lg" />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold leading-tight text-foreground">InnovaSetu</p>
        <p className="truncate text-[11px] text-muted-foreground">{roleLabels[user.role]}</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:flex",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {collapsed ? (
            <img src="/logo.png" alt="InnovaSetu" className="h-9 w-9 rounded-lg" />
          ) : (
            brand
          )}
        </div>
        <div className="flex-1 py-4">
          <NavList items={items} pathname={pathname} collapsed={collapsed} />
        </div>
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => setCollapsed((c) => !c)}
          >
            <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && "Collapse"}
          </Button>
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-16 items-center border-b border-sidebar-border px-4">{brand}</div>
          <div className="py-4">
            <NavList
              items={items}
              pathname={pathname}
              collapsed={false}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <img src="/logo.png" alt="InnovaSetu" className="h-8 w-auto rounded-md" />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-secondary">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:block">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <ShieldCheck className="mr-2 size-4" /> {roleLabels[user.role]}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" /> Account settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 size-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {title}
              </h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {children}
          </div>
        </main>

        <footer className="border-t border-border bg-card px-6 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Government of Jharkhand · InnovaSetu
        </footer>
      </div>
    </div>
  );
}