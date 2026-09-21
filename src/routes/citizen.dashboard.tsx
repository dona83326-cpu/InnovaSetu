import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FilePlus2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/session";

export const Route = createFileRoute("/citizen/dashboard")({
  component: CitizenDashboard,
});

function CitizenDashboard() {
  const [userName, setUserName] = useState("Citizen");
  const [userEmail, setUserEmail] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const session = getSession();
      if (session) {
        setUserName(session.name);
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        const { data } = await supabase
          .from("challenges")
          .select("*")
          .eq("user_id", user.id);
        if (data) setReports(data);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-8" />
            <h1 className="text-xl font-bold">InnovaSetu</h1>
          </div>
          
          {/* Profile Dropdown */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-sm">{userName}</p>
              <p className="text-xs text-gray-500">{userEmail}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                localStorage.removeItem("sicp-session");
                window.location.href = "/login";
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome, {userName}</h1>
          <p className="text-gray-600">Your workspace for civic problem solving.</p>
        </div>

        <div className="text-center mb-8">
          <Link to="/citizen/submit">
            <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-4 text-lg">
              <FilePlus2 className="w-5 h-5 mr-2" />
              Report a New Problem
            </Button>
          </Link>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">My Reports</h2>
          {reports.length === 0 ? (
            <div className="border rounded-lg p-12 text-center">
              <FilePlus2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No reports yet</h3>
              <p className="text-gray-600 mb-6">Start by reporting a problem in your area</p>
              <Link to="/citizen/submit">
                <Button variant="outline">Report a Problem</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4">
                  <h3 className="font-bold text-lg">{report.title}</h3>
                  <p className="text-gray-600 text-sm mt-2">{report.description}</p>
                  <p className="text-xs text-gray-500 mt-2">Status: {report.status || "Pending"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}