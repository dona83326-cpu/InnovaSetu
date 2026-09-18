import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/industry/proposal/$id")({
  head: () => ({
    meta: [
      { title: "Execution Bid — SICP Jharkhand" },
      {
        name: "description",
        content: "Submit an execution bid for a Government-approved project.",
      },
      { property: "og:title", content: "Execution Bid — SICP Jharkhand" },
      {
        property: "og:description",
        content: "Submit an execution bid for a Government-approved project.",
      },
    ],
  }),
  component: IndustryProposal,
});

type Row = Record<string, unknown>;
const submittedStatuses = new Set([
  "submitted",
  "funded",
  "active",
  "approved",
  "accepted",
  "released",
]);

function valueOrFallback(value: unknown, fallback = "Not provided") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function locationValue(challenge: Row) {
  if (challenge.district || challenge.block) {
    const location = [challenge.district, challenge.block_ward ?? challenge.block]
      .filter(Boolean)
      .join(", ");
    return challenge.latitude != null && challenge.longitude != null
      ? `${location} (${String(challenge.latitude)}, ${String(challenge.longitude)})`
      : location;
  }
  return valueOrFallback(challenge.location);
}

function IndustryProposal() {
  const { id } = useParams({ from: "/industry/proposal/$id" });
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Row | null>(null);
  const [challenge, setChallenge] = useState<Row | null>(null);
  const [university, setUniversity] = useState<Row | null>(null);
  const [existingBid, setExistingBid] = useState<Row | null>(null);
  const [industryId, setIndustryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [timeline, setTimeline] = useState("");
  const [approach, setApproach] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadProposal = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        if (active) {
          setError(authError?.message ?? "Please log in as an industry user.");
          setLoading(false);
        }
        return;
      }
      const currentIndustryId = authData.user.id;
      const { data: proposalData, error: proposalError } = await supabase
        .from("university_solutions")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (proposalError || !proposalData) {
        if (active) {
          setError(proposalError?.message ?? "This proposal is no longer available.");
          setLoading(false);
        }
        return;
      }
      const [
        { data: challengeData, error: challengeError },
        { data: profileData, error: profileError },
        { data: bids, error: bidError },
      ] = await Promise.all([
        supabase.from("challenges").select("*").eq("id", proposalData.challenge_id).maybeSingle(),
        supabase.from("profiles").select("*").eq("id", proposalData.university_id).maybeSingle(),
        supabase
          .from("industry_bids")
          .select("*")
          .eq("challenge_id", proposalData.challenge_id)
          .eq("industry_id", currentIndustryId),
      ]);
      if (!active) return;
      const queryError = challengeError || profileError || bidError;
      if (queryError) setError(queryError.message);
      else {
        setIndustryId(currentIndustryId);
        setProposal(proposalData as Row);
        setChallenge((challengeData as Row | null) ?? null);
        setUniversity((profileData as Row | null) ?? null);
        const fundedBid = ((bids ?? []) as Row[]).find((bid) =>
          submittedStatuses.has(String(bid.status ?? "").toLowerCase()),
        );
        setExistingBid(fundedBid ?? null);
      }
      setLoading(false);
    };
    void loadProposal();
    return () => {
      active = false;
    };
  }, [id]);

  const submitBid = async () => {
    if (!proposal || !challenge || !industryId || submitting) return;
    if (existingBid) return;
    if (!amount.trim() || !timeline.trim() || !approach.trim()) {
      toast.error("Complete the amount, timeline and execution approach.");
      return;
    }
    setSubmitting(true);
    const proposedBudget = Number(amount.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(proposedBudget)) {
      toast.error("Enter a valid numeric bid amount.");
      setSubmitting(false);
      return;
    }
    const { data, error: insertError } = await supabase
      .from("industry_bids")
      .insert({
        challenge_id: String(proposal.challenge_id),
        industry_id: industryId,
        proposed_budget: proposedBudget,
        timeline: timeline.trim(),
        execution_approach: approach.trim(),
        status: "submitted",
      })
      .select("*");
    if (insertError) {
      toast.error(insertError.message);
    } else if (!data?.length) {
      toast.error("The execution bid was not created.");
    } else {
      setExistingBid(data[0] as Row);
      toast.success("Execution bid submitted successfully.");
      await navigate({ to: "/industry/bids" });
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <AppLayout role="industry" title="Loading proposal">
        <p className="text-sm text-muted-foreground">Loading proposal...</p>
      </AppLayout>
    );
  }

  if (error || !proposal || !challenge) {
    return (
      <AppLayout role="industry" title="Proposal not found">
        <EmptyState
          title="No execution project found"
          description={error ?? "The proposal or related challenge is no longer available."}
          action={
            <Button asChild>
              <Link to="/industry/dashboard">Back to open projects</Link>
            </Button>
          }
        />
      </AppLayout>
    );
  }

  const solutionProposal = String(proposal.solution_proposal ?? "");
  const currentStatus = existingBid ? String(existingBid.status ?? "funded") : null;

  return (
    <AppLayout
      role="industry"
      title={valueOrFallback(challenge.title)}
      subtitle="Submit an execution bid for this Government-approved project."
    >
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/industry/dashboard">
          <ArrowLeft className="mr-2 size-4" /> Back to open projects
        </Link>
      </Button>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {valueOrFallback(challenge.category)}
              </span>
              <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                {valueOrFallback(challenge.priority)}
              </span>
            </div>
            <p className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" /> {locationValue(challenge)}
            </p>
            <h2 className="mt-5 text-lg font-semibold">Government-approved university solution</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {valueOrFallback(solutionProposal)}
            </p>
          </section>
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-semibold">Challenge description</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {valueOrFallback(challenge.description)}
            </p>
          </section>
        </div>
        <aside className="h-fit rounded-xl border border-primary/20 bg-primary/5 p-6 lg:sticky lg:top-6">
          <h2 className="font-semibold">Execution bid</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">University</dt>
              <dd className="text-right font-medium">
                {valueOrFallback(
                  university?.organization_name ?? university?.full_name,
                  "University not provided",
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Government status</dt>
              <dd className="text-right font-medium">{valueOrFallback(proposal.status)}</dd>
            </div>
          </dl>
          {existingBid ? (
            <div className="mt-6 rounded-lg bg-success/10 p-3 text-sm text-success">
              Your bid is {currentStatus}.
            </div>
          ) : (
            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void submitBid();
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="amount">Bid amount</Label>
                <Input
                  id="amount"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="e.g. INR 8,50,000"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="timeline">Execution timeline</Label>
                <Input
                  id="timeline"
                  value={timeline}
                  onChange={(event) => setTimeline(event.target.value)}
                  placeholder="e.g. 12 weeks"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="approach">Execution approach</Label>
                <Textarea
                  id="approach"
                  rows={4}
                  value={approach}
                  onChange={(event) => setApproach(event.target.value)}
                  placeholder="Describe how your team will execute the approved scope."
                />
              </div>
              <Button size="lg" className="w-full" disabled={submitting} type="submit">
                <Send className="mr-2 size-4" />{" "}
                {submitting ? "Submitting..." : "Submit execution bid"}
              </Button>
            </form>
          )}
        </aside>
      </div>
    </AppLayout>
  );
}
