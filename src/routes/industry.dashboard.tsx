// @ts-nocheck
import { createFileRoute, Link } from "@tanstack/react-router";
import { BriefcaseBusiness, Loader2, MapPin, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { RoleGuard } from "@/components/RoleGuard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/industry/dashboard")({
  head: () => ({ meta: [{ title: "Industry Dashboard — InnovaSetu" }] }),
  component: IndustryDashboardRoute,
});

function IndustryDashboardRoute() {
  return (
    <RoleGuard role="industry">
      <IndustryWorkspace view="bids" />
    </RoleGuard>
  );
}

// ✅ ADDED 'export' HERE so other files can import it
export function IndustryWorkspace({ view }) {
  const [proposals, setProposals] = useState([]);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingBidId, setUploadingBidId] = useState(null);
  const [industryName, setIndustryName] = useState("Industry Partner");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) return;
        const userId = authData.user.id;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, organization_name, role")
          .eq("id", userId)
          .maybeSingle();
        
        if (!active) return;
        
        const name = profile?.organization_name || profile?.full_name || "Industry Partner";
        setIndustryName(name);

        const { data: challengesData } = await supabase.from("challenges").select("*");
        if (!active) return;
        const challengeMap = new Map((challengesData || []).map((c) => [String(c.id), c]));

        const { data: industryBidsData } = await supabase.from("industry_bids").select("*").eq("industry_id", userId).order("created_at", { ascending: false });
        if (!active) return;

        const { data: solutionsData } = await supabase.from("university_solutions").select("*");
        if (!active) return;

        const enrichedProposals = (solutionsData || [])
          .map((s) => ({ ...s, challenge: challengeMap.get(String(s.challenge_id)) }))
          .filter((s) => String(s.challenge?.status || "").toLowerCase() === "industry_bidding");
        setProposals(enrichedProposals);

        const enrichedBids = (industryBidsData || [])
          .map((b) => ({ ...b, challenge: challengeMap.get(String(b.challenge_id)) }))
          .filter((b) => Boolean(b.challenge));
        setBids(enrichedBids);
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const submitProof = async (bid, file) => {
    if (!file || uploadingBidId) return;
    setUploadingBidId(String(bid.id));
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error("Please log in.");
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${authData.user.id}/proof-${bid.id}-${Date.now()}.${extension}`;
      toast.info("Uploading proof of work...");
      const { error: uploadError } = await supabase.storage.from("proof-of-work").upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("proof-of-work").getPublicUrl(path);
      const existingUrls = Array.isArray(bid.proof_of_work_urls) ? bid.proof_of_work_urls.filter((u) => typeof u === "string") : [];
      const newUrls = [...existingUrls, urlData.publicUrl];
      
      await supabase.from("industry_bids").update({ 
        proof_of_work_urls: newUrls, 
        status: "submitted_for_verification" 
      }).eq("id", String(bid.id));
      
      setBids((current) => current.map((item) => String(item.id) === String(bid.id) ? { ...item, proof_of_work_urls: newUrls, status: "submitted_for_verification" } : item));
      toast.success("Proof submitted! Status is now Under Review.");
    } catch (error) {
      toast.error("Upload failed.");
    } finally {
      setUploadingBidId(null);
    }
  };

  const getStatusBadge = (status) => {
    const s = status.toLowerCase();
    if (s === "funded") return { text: "✓ Selected • Ready for Execution", color: "bg-green-100 text-green-700" };
    if (s === "submitted_for_verification") return { text: "Under Review by Government", color: "bg-yellow-100 text-yellow-700" };
    if (s === "rejected") return { text: "Not Selected", color: "bg-red-100 text-red-700" };
    if (s === "revision_required") return { text: "⚠ Needs More Work", color: "bg-orange-100 text-orange-700" };
    if (s === "completed") return { text: "Project Completed", color: "bg-blue-100 text-blue-700" };
    return { text: "Pending", color: "bg-gray-100 text-gray-700" };
  };

  const displayValue = (value, fallback = "Not provided") => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "string") return value.trim() ? value : fallback;
    if (typeof value === "number") return Number.isFinite(value) ? String(value) : fallback;
    return String(value);
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "Not provided";
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return displayValue(value);
    return `₹${numericValue.toLocaleString("en-IN")}`;
  };

  const locationValue = (challenge) => {
    if (challenge.district || challenge.block_ward) {
      return [challenge.district, challenge.block_ward].filter(Boolean).join(", ");
    }
    return displayValue(challenge.location);
  };

  if (loading) return <AppLayout role="industry" title="Loading..."><div className="p-8">Loading...</div></AppLayout>;

  return (
    <AppLayout role="industry" title="Industry Execution Workspace" subtitle="Bid for Government-approved projects.">
      {view === "open-projects" && (
        <section className="rounded-xl border border-border bg-card shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-4">Projects Open for Execution</h2>
          {proposals.length === 0 ? <EmptyState title="No projects open" description="Bidding will open here." /> : (
            <div className="grid gap-4 md:grid-cols-2">
              {proposals.map((p) => (
                <div key={p.id} className="border rounded-lg p-4 bg-background">
                  <h3 className="font-bold">{p.challenge?.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{locationValue(p.challenge)}</p>
                  <Button asChild size="sm" className="mt-2"><Link to="/industry/proposal/$id" params={{ id: String(p.id) }}>View & Bid</Link></Button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {view === "bids" && (
        <section className="rounded-xl border border-border bg-card shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-4">My Bids & Projects</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {bids.map((bid) => {
              const statusBadge = getStatusBadge(String(bid.status || ""));
              const isFunded = String(bid.status || "").toLowerCase() === "funded";
              const isUnderReview = String(bid.status || "").toLowerCase() === "submitted_for_verification";
              const needsRevision = String(bid.status || "").toLowerCase() === "revision_required";
              const proofUrls = Array.isArray(bid.proof_of_work_urls) ? bid.proof_of_work_urls.filter((u) => typeof u === "string") : [];

              return (
                <div key={bid.id} className="border rounded-lg p-4 bg-background">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold">{bid.challenge?.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}>{statusBadge.text}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{locationValue(bid.challenge)}</p>
                  <div className="mt-3 text-sm space-y-1">
                    <p><strong>Bid Amount:</strong> {formatCurrency(bid.proposed_budget)}</p>
                    <p><strong>Timeline:</strong> {displayValue(bid.timeline)}</p>
                  </div>

                  {isFunded && (
                    <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                      <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => void submitProof(bid, e.target.files?.[0])} disabled={uploadingBidId === String(bid.id)} />
                      {uploadingBidId === String(bid.id) ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                      Submit Proof of Work
                    </label>
                  )}

                  {isUnderReview && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-sm font-semibold text-yellow-800">Proof Submitted ({proofUrls.length} files)</p>
                      <p className="text-xs text-yellow-700 mt-1">Government is reviewing your work.</p>
                    </div>
                  )}

                  {needsRevision && (
                    <div className="mt-4 p-3 bg-orange-50 rounded border border-orange-200">
                      <p className="text-sm font-semibold text-orange-800">⚠ Revision Required</p>
                      <p className="text-xs text-orange-700 mt-1">Government requested changes. Please update and resubmit.</p>
                      <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                        <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => void submitProof(bid, e.target.files?.[0])} disabled={uploadingBidId === String(bid.id)} />
                        {uploadingBidId === String(bid.id) ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                        Resubmit Proof
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </AppLayout>
  );
}