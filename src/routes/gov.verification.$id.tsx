// @ts-nocheck
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/gov/verification/$id")({
  component: GovVerificationDetail,
});

function GovVerificationDetail() {
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [project, setProject] = useState(null);

  useEffect(() => {
    async function loadProject() {
      try {
        if (!id) return;

        const { data: bid } = await supabase.from("industry_bids").select("*").eq("id", id).single();
        if (!bid) { setLoading(false); return; }

        const { data: challenge } = await supabase.from("challenges").select("id, title").eq("id", bid.challenge_id).single();
        const { data: industryProfile } = await supabase.from("profiles").select("full_name, organization_name").eq("id", bid.industry_id).single();

        setProject({ ...bid, challenges: challenge, profiles: industryProfile });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id]);

  // APPROVE WORK - Mark as solved
  const handleApprove = async () => {
    if (!project) return;
    try {
      setVerifying(true);

      // 1. Mark Challenge as SOLVED (Citizen sees this)
      await supabase.from("challenges").update({ status: "solved" }).eq("id", project.challenge_id);

      // 2. Mark Industry Bid as COMPLETED (Industry gets funded)
      await supabase.from("industry_bids").update({ status: "completed" }).eq("id", project.id);

      toast.success("Work Approved! Citizen notified as Solved.");
      navigate({ to: "/gov/dashboard" });
    } catch (error) {
      toast.error("Approval failed");
    } finally {
      setVerifying(false);
    }
  };

  // NEED MORE WORK - Send back to industry
  const handleNeedMoreWork = async () => {
    if (!project) return;
    try {
      setVerifying(true);

      // 1. Keep Challenge status as 'execution_in_progress' (Citizen still sees "In Progress")
      // 2. Mark Industry Bid as 'revision_required'
      await supabase.from("industry_bids").update({ status: "revision_required" }).eq("id", project.id);

      toast.success("Feedback sent to Industry. Work marked for revision.");
      navigate({ to: "/gov/dashboard" });
    } catch (error) {
      toast.error("Failed to send feedback");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <AppLayout role="gov" title="Loading..."><div className="p-8">Loading...</div></AppLayout>;
  if (!project) return <AppLayout role="gov" title="Not Found"><div className="p-8">Project not found</div></AppLayout>;

  const industryName = project.profiles?.organization_name || project.profiles?.full_name || "Unknown Industry";
  const proofUrls = Array.isArray(project.proof_of_work_urls) ? project.proof_of_work_urls : [];

  return (
    <AppLayout role="gov" title="Project Verification" subtitle="Review proof of work submitted by Industry">
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/gov/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
      </Button>

      <div className="rounded-xl border p-6 max-w-3xl bg-card">
        <h2 className="text-2xl font-bold mb-2">{project.challenges?.title}</h2>
        <p className="text-muted-foreground mb-6">Industry: {industryName}</p>

        {/* Proof of Work Section */}
        <div className="mb-6 p-4 bg-secondary/50 rounded-lg border border-border">
          <h3 className="font-semibold mb-2">Proof of Work Submitted</h3>
          {proofUrls.length > 0 ? (
            <ul className="space-y-2">
              {proofUrls.map((url, i) => (
                <li key={i}>
                  <a href={url} target="_blank" rel="noreferrer" className="text-primary underline text-sm">
                    View Proof Document {i + 1}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No files uploaded.</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={handleApprove} 
            disabled={verifying} 
            className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 text-lg"
          >
            <CheckCircle className="mr-2 h-5 w-5" /> 
            {verifying ? "Processing..." : "Approve Work (Mark as Solved)"}
          </Button>
          
          <Button 
            onClick={handleNeedMoreWork} 
            disabled={verifying} 
            variant="outline" 
            className="flex-1 border-orange-500 text-orange-600 hover:bg-orange-50 h-12 text-lg"
          >
            <XCircle className="mr-2 h-5 w-5" /> 
            {verifying ? "Processing..." : "Need More Work"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}