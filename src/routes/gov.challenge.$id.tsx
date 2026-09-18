// @ts-nocheck
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/gov/challenge/$id")({
  component: GovChallengeDetail,
});

function GovChallengeDetail() {
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [challenge, setChallenge] = useState(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const { data } = await supabase.from("challenges").select("*").eq("id", id).single();
      setChallenge(data);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleAction = async (newStatus, successMessage) => {
    if (!challenge) return;
    setProcessing(true);
    try {
      await supabase.from("challenges").update({ status: newStatus }).eq("id", id);
      toast.success(successMessage);
      navigate({ to: "/gov/dashboard" });
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <AppLayout role="gov" title="Loading..."><div className="p-8">Loading...</div></AppLayout>;
  if (!challenge) return <AppLayout role="gov" title="Not Found"><div className="p-8">Challenge not found</div></AppLayout>;

  return (
    <AppLayout role="gov" title="Challenge Details" subtitle="Reviewing emergency report">
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/gov/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
      </Button>

      <div className="rounded-xl border p-6 max-w-3xl bg-card">
        <h2 className="text-2xl font-bold mb-4">{challenge.title}</h2>
        <div className="space-y-4 text-lg">
          <p><strong className="text-muted-foreground">Location:</strong> {challenge.district}, {challenge.block_ward}</p>
          <p><strong className="text-muted-foreground">Category:</strong> {challenge.category || challenge.ai_category}</p>
          <p><strong className="text-muted-foreground">Priority:</strong> <span className="text-red-600 font-bold">{challenge.priority || challenge.ai_priority}</span></p>
          <p><strong className="text-muted-foreground">Description:</strong></p>
          <p className="bg-secondary/50 p-4 rounded-lg">{challenge.description}</p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button 
            onClick={() => handleAction("open_for_university_solutions", "Approved & sent to University!")} 
            disabled={processing}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {processing ? "Processing..." : "Approve"}
          </Button>
          
          <Button 
            onClick={() => handleAction("open_for_university_solutions", "Reverted back to University for revision!")} 
            disabled={processing}
            variant="outline"
            className="flex-1 border-orange-500 text-orange-600 hover:bg-orange-50"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {processing ? "Processing..." : "Revert to University"}
          </Button>

          <Button 
            onClick={() => handleAction("rejected", "Report Rejected!")} 
            disabled={processing}
            variant="outline"
            className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
          >
            <XCircle className="mr-2 h-4 w-4" />
            {processing ? "Processing..." : "Reject"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}