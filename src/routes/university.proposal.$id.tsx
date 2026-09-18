import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/university/proposal/$id")({
  head: () => ({
    meta: [
      { title: "Proposal Details — SICP Jharkhand" },
      {
        name: "description",
        content: "View the details of a submitted university proposal.",
      },
    ],
  }),
  component: UniversityProposal,
});

type Row = Record<string, unknown>;

function displayValue(value: unknown, fallback = "Not provided") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function proposalField(proposal: string, label: string) {
  const match = proposal.match(new RegExp(`^${label}:\\s*(.+)$`, "im"));
  return match?.[1]?.trim() ?? "Not provided";
}

function studentNames(value: unknown) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean).join(", ") || "Not provided";
  return displayValue(value);
}

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function UniversityProposal() {
  const { id } = useParams({ from: "/university/proposal/$id" });
  const [proposal, setProposal] = useState<Row | null>(null);
  const [challenge, setChallenge] = useState<Row | null>(null);
  const [university, setUniversity] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadProposal = async () => {
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
      ] = await Promise.all([
        supabase
          .from("challenges")
          .select("title")
          .eq("id", proposalData.challenge_id)
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("full_name, organization_name")
          .eq("id", proposalData.university_id)
          .maybeSingle(),
      ]);

      if (!active) return;
      const queryError = challengeError || profileError;
      if (queryError) setError(queryError.message);
      else {
        setProposal(proposalData as Row);
        setChallenge((challengeData as Row | null) ?? null);
        setUniversity((profileData as Row | null) ?? null);
      }
      setLoading(false);
    };

    void loadProposal();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <AppLayout role="university" title="Loading proposal">
        <p className="text-sm text-muted-foreground">Loading proposal...</p>
      </AppLayout>
    );
  }

  if (error || !proposal) {
    return (
      <AppLayout role="university" title="Proposal not found">
        <EmptyState
          title="No proposal found"
          description={error ?? "This proposal is no longer available."}
          action={
            <Button asChild>
              <Link to="/university/dashboard">Back to dashboard</Link>
            </Button>
          }
        />
      </AppLayout>
    );
  }

  const solutionProposal = String(proposal.solution_proposal ?? "");
  const status = displayValue(proposal.status);
  const isFunded = status.toLowerCase() === "funded";
  const universityName = displayValue(
    university?.organization_name ?? university?.full_name,
    "University not provided",
  );

  return (
    <AppLayout
      role="university"
      title={displayValue(challenge?.title, "Proposal details")}
      subtitle="Review the submitted university proposal."
    >
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/university/dashboard" hash="my-proposals">
          <ArrowLeft className="mr-2 size-4" /> Back to my proposals
        </Link>
      </Button>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Challenge title</p>
            <h2 className="mt-1 text-xl font-semibold">{displayValue(challenge?.title)}</h2>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isFunded ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
            }`}
          >
            {isFunded ? "Funded" : status}
          </span>
        </div>

        <dl className="mt-6 grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">University name</dt>
            <dd className="mt-1 font-medium">{universityName}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Mentor</dt>
            <dd className="mt-1 font-medium">{displayValue(proposal.mentor_name)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Student/team members</dt>
            <dd className="mt-1 font-medium">{studentNames(proposal.student_names)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Proposal status</dt>
            <dd className="mt-1 font-medium">{isFunded ? "Funded" : status}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Submission date</dt>
            <dd className="mt-1 font-medium">{formatDate(proposal.created_at)}</dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-border pt-5">
          <h2 className="font-semibold">Solution approach</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {proposalField(solutionProposal, "Solution approach")}
          </p>
        </div>
      </section>
    </AppLayout>
  );
}
