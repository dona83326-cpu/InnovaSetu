import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BriefcaseBusiness, Inbox, Scale, ShieldCheck, History } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/gov/dashboard")({
  head: () => ({ meta: [{ title: "Government Dashboard — InnovaSetu" }] }),
  component: GovDashboard,
});

// ✅ ADDED 'export' HERE so Vercel can build it properly
export function GovDashboard() {
  const [activeTab, setActiveTab] = useState("emergency");
  const [challenges, setChallenges] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [bids, setBids] = useState([]);
  const [projects, setProjects] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          { data: challengeData, error: err1 },
          { data: solutionData, error: err2 },
          { data: bidData, error: err3 },
          { data: profileData, error: err4 }
        ] = await Promise.all([
          supabase.from("challenges").select("*").order("created_at", { ascending: false }),
          supabase.from("university_solutions").select("*, challenge:challenges(id, title, district, block_ward, status), university:profiles(id, full_name, organization_name)"),
          supabase.from("industry_bids").select("*"),
          supabase.from("profiles").select("id, full_name, organization_name"),
        ]);

        if (err1) throw err1;
        if (err2) throw err2;
        if (err3) throw err3;
        if (err4) throw err4;

        const profilesById = new Map((profileData || []).map((p: any) => [String(p.id), p]));
        const challengeMap = new Map((challengeData || []).map((c: any) => [String(c.id), c]));

        // 1. Emergency Challenges
        const emergencyList = (challengeData || []).filter((c: any) => {
          const status = String(c.status || "").toLowerCase();
          return ["government_review", "submitted", "ai_reviewed", "pending_review"].includes(status) && Boolean(c.is_emergency);
        });
        setChallenges(emergencyList);

        // 2. University Proposals
        const proposalsList = (solutionData || []).filter((s: any) => {
          const cStatus = String(s.challenge?.status || "").toLowerCase();
          return ["open_for_university_solutions", "proposal_received"].includes(cStatus) && String(s.status).toLowerCase() === "submitted";
        }).map((s: any) => ({
          ...s,
          university_name: s.university?.organization_name || profilesById.get(String(s.university_id))?.organization_name || "University not found"
        }));
        setProposals(proposalsList);

        // 3. Industry Bids
        const activeBids = (bidData || []).filter((b: any) => {
          const c = challengeMap.get(String(b.challenge_id));
          return String(b.status).toLowerCase() === "submitted" && String(c?.status || "").toLowerCase() === "industry_bidding";
        }).map((b: any) => ({
          ...b,
          challenge: challengeMap.get(String(b.challenge_id)),
          industry_name: profilesById.get(String(b.industry_id))?.organization_name || "Industry not found"
        }));
        setBids(activeBids);

        // 4. Projects to Verify
        const verificationProjects = (bidData || []).filter((b: any) => {
          const c = challengeMap.get(String(b.challenge_id));
          return ["funded", "submitted_for_verification"].includes(String(b.status).toLowerCase()) && String(c?.status || "").toLowerCase() !== "solved";
        }).map((b: any) => ({
          ...b,
          challenge: challengeMap.get(String(b.challenge_id)),
          industry_name: profilesById.get(String(b.industry_id))?.organization_name || "Industry not found"
        }));
        setProjects(verificationProjects);

        // 5. Project History
        const historyList = (bidData || []).filter((b: any) => {
          const status = String(b.status || "").toLowerCase();
          return ["completed", "rejected", "revision_required"].includes(status);
        }).map((b: any) => ({
          ...b,
          challenge: challengeMap.get(String(b.challenge_id)),
          industry_name: profilesById.get(String(b.industry_id))?.organization_name || "Industry not found"
        }));
        setHistory(historyList);

      } catch (err: any) {
        console.error("Dashboard Load Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const selectSolution = async (solution: any) => {
    try {
      await supabase.from("university_solutions").update({ status: "government_approved" }).eq("id", solution.id);
      await supabase.from("challenges").update({ status: "industry_bidding" }).eq("id", solution.challenge_id);
      toast.success("Solution selected! Project open for industry bids.");
      window.location.reload();
    } catch (e) {
      toast.error("Failed to select solution");
    }
  };

  const selectBid = async (bid: any) => {
    const challengeId = String(bid.challenge_id);
    const selectedBidId = String(bid.id);

    try {
      await supabase.from("industry_bids").update({ status: "funded" }).eq("id", selectedBidId);
      await supabase.from("industry_bids").update({ status: "rejected" }).eq("challenge_id", challengeId).neq("id", selectedBidId);
      await supabase.from("challenges").update({ status: "execution_in_progress" }).eq("id", challengeId);
      toast.success("Industry selected! Other bids marked as not selected.");
      window.location.reload();
    } catch (e) {
      toast.error("Failed to select industry");
    }
  };

  const tabs = [
    { id: "emergency", label: "Emergency Review", icon: Inbox, count: challenges.length },
    { id: "proposals", label: "University Proposals", icon: Scale, count: proposals.length },
    { id: "bids", label: "Industry Bids", icon: BriefcaseBusiness, count: bids.length },
    { id: "verification", label: "Project Verification", icon: ShieldCheck, count: projects.length },
    { id: "history", label: "Project History", icon: History, count: history.length },
  ];

  const displayValue = (value: any, fallback = "Not provided") => {
    if (value === null || value === undefined || value === "") return fallback;
    if (typeof value === "number") return `₹${value.toLocaleString("en-IN")}`;
    if (typeof value === "string" && value.trim()) return value;
    return fallback;
  };

  const locationValue = (challenge: any) => {
    if (challenge.district || challenge.block_ward) {
      return [challenge.district, challenge.block_ward].filter(Boolean).join(", ");
    }
    return displayValue(challenge.location);
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "completed") return { text: "Solved", color: "bg-green-100 text-green-700" };
    if (s === "rejected") return { text: "Rejected", color: "bg-red-100 text-red-700" };
    if (s === "revision_required") return { text: "Needs Work", color: "bg-orange-100 text-orange-700" };
    return { text: status, color: "bg-gray-100 text-gray-700" };
  };

  if (loading) return <AppLayout role="gov" title="Loading..."><div className="p-8 text-center">Loading dashboard...</div></AppLayout>;
  
  if (error) return (
    <AppLayout role="gov" title="Error">
      <div className="p-8 text-center text-red-600">
        <h2 className="text-xl font-bold mb-4">Failed to load dashboard</h2>
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout role="gov" title="Government Dashboard" subtitle="Manage civic innovation workflow.">
      <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <tab.icon className="size-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? "bg-white/20" : "bg-primary/20 text-primary"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "emergency" && (
        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Inbox className="text-primary" /> Emergency Reports</h2>
            {challenges.length === 0 ? (
              <EmptyState title="No emergencies" description="No critical reports need immediate attention." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {challenges.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell>{locationValue(c)}</TableCell>
                      <TableCell><span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold">{c.priority}</span></TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm">
                          <Link to="/gov/challenge/$id" params={{ id: String(c.id) }}>Review</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>
      )}

      {activeTab === "proposals" && (
        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Scale className="text-primary" /> University Solutions</h2>
            {proposals.length === 0 ? (
              <EmptyState title="No proposals" description="Wait for universities to submit solutions." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {proposals.map((sol: any) => (
                  <div key={sol.id} className="border rounded-lg p-4 bg-background">
                    <h3 className="font-bold">{sol.challenge?.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">By: {sol.university_name}</p>
                    <p className="text-sm mb-4 line-clamp-3">{sol.solution_proposal}</p>
                    <Button onClick={() => selectSolution(sol)} className="w-full">Select Solution</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === "bids" && (
        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><BriefcaseBusiness className="text-primary" /> Industry Bids</h2>
            {bids.length === 0 ? (
              <EmptyState title="No bids" description="Wait for industries to bid on selected solutions." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {bids.map((bid: any) => (
                  <div key={bid.id} className="border rounded-lg p-4 bg-background">
                    <h3 className="font-bold">{bid.challenge?.title}</h3>
                    <p className="text-sm text-muted-foreground">Industry: {bid.industry_name}</p>
                    <p className="text-lg font-bold text-primary my-2">{displayValue(bid.proposed_budget)}</p>
                    <p className="text-sm mb-4">{bid.execution_approach}</p>
                    <Button onClick={() => selectBid(bid)} className="w-full">Select Industry</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === "verification" && (
        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><ShieldCheck className="text-primary" /> Projects to Verify</h2>
            {projects.length === 0 ? (
              <EmptyState title="No projects" description="Projects will appear here after industry submits work." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {projects.map((proj: any) => (
                  <div key={proj.id} className="border rounded-lg p-4 bg-background">
                    <h3 className="font-bold">{proj.challenge?.title}</h3>
                    <p className="text-sm text-muted-foreground">Industry: {proj.industry_name}</p>
                    <div className="my-3 p-3 bg-secondary/50 rounded text-sm">
                      <p>Status: <span className="font-bold">{proj.status}</span></p>
                      {proj.proof_of_work_urls && proj.proof_of_work_urls.length > 0 && (
                        <p className="text-green-600 mt-1">✓ Proof of work submitted ({proj.proof_of_work_urls.length} files)</p>
                      )}
                    </div>
                    <Button asChild className="w-full">
                      <Link to="/gov/verification/$id" params={{ id: String(proj.id) }}>Review & Verify</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === "history" && (
        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><History className="text-primary" /> Project History</h2>
            {history.length === 0 ? (
              <EmptyState title="No history" description="Completed and rejected projects will appear here." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item: any) => {
                    const badge = getStatusBadge(item.status);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.challenge?.title}</TableCell>
                        <TableCell>{item.industry_name}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                            {badge.text}
                          </span>
                        </TableCell>
                        <TableCell>{displayValue(item.proposed_budget)}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </section>
      )}
    </AppLayout>
  );
}