import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FilePlus2, MapPin, CalendarDays, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/session";

export const Route = createFileRoute("/citizen/dashboard")({
  head: () => ({
    meta: [
      { title: "Citizen Dashboard — InnovaSetu" },
    ],
  }),
  component: CitizenDashboard,
});

function CitizenDashboard() {
  const [userName, setUserName] = useState("Citizen");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const session = getSession();
    console.log("Citizen Dashboard - Session:", session);
    
    if (!session || session.role !== "citizen") {
      console.log("No valid citizen session, redirecting to login");
      // Don't redirect immediately - let's see what happens
    } else {
      setUserName(session.name);
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="InnovaSetu" className="h-8 w-auto" />
            <span className="text-lg font-bold">InnovaSetu</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {userName}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                localStorage.removeItem("sicp-session");
                window.location.href = "/login";
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Reports</h1>
          <p className="text-muted-foreground">Track your reported problems and their status</p>
        </div>

        <div className="grid gap-4">
          {/* Empty State */}
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FilePlus2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No reports yet</h2>
            <p className="text-muted-foreground mb-6">
              Start by reporting a problem in your area
            </p>
            <Link to="/citizen/submit">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <FilePlus2 className="mr-2 h-4 w-4" />
                Report a Problem
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}