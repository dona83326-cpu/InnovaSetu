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
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Check local session for name
        const session = getSession();
        if (session && session.role === "citizen") {
          setUserName(session.name);
        }
        
        // 2. Fetch actual reports from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("challenges")
            .select("id, title, description, status, created_at, priority, is_emergency")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          
          if (!error && data) {
            setReports(data);
          }
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-primary">InnovaSetu</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, <strong>{userName}</strong></span>
            <Button 
              variant="destructive" 
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
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Reports</h1>
            <p className="text-muted-foreground">Track your reported problems and their status</p>
          </div>
          <Link to="/citizen/submit">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
              <FilePlus2 className="mr-2 h-4 w-4" />
              Report a New Problem
            </Button>
          </Link>
        </div>

        {/* Reports List or Empty State */}
        {reports.length === 0 ? (
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
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => {
              // Determine badge color based on status
              const statusLower = (report.status || "pending").toLowerCase();
              let badgeClass = "bg-blue-100 text-blue-700";
              if (statusLower.includes("solved") || statusLower.includes("completed")) badgeClass = "bg-green-100 text-green-700";
              else if (statusLower.includes("reject")) badgeClass = "bg-red-100 text-red-700";
              else if (statusLower.includes("review") || statusLower.includes("bidding")) badgeClass = "bg-yellow-100 text-yellow-700";

              return (
                <div key={report.id} className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg line-clamp-1">{report.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${badgeClass}`}>
                      {report.status ? report.status.replace(/_/g, " ").toUpperCase() : "PENDING"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3 min-h-[3.75rem]">
                    {report.description || "No description provided."}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(report.created_at).toLocaleDateString()}
                    </div>
                    {report.is_emergency && (
                      <span className="flex items-center gap-1 text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded">
                        <MapPin className="h-3.5 w-3.5" /> Emergency
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}