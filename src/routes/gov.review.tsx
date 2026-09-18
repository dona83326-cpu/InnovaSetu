import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/gov/review")({
  head: () => ({
    meta: [
      { title: "Challenge Review — SICP Jharkhand" },
      {
        name: "description",
        content: "Review citizen-reported challenges awaiting Government approval.",
      },
      { property: "og:title", content: "Challenge Review — SICP Jharkhand" },
      {
        property: "og:description",
        content: "Review citizen-reported challenges awaiting Government approval.",
      },
    ],
  }),
  component: GovReview,
});

type ChallengeRow = Record<string, unknown>;
const reviewStatuses = new Set(["submitted", "ai_reviewed", "pending_review"]);

function needsReview(challenge: ChallengeRow) {
  return [challenge.status, challenge.triage_status].some((value) =>
    reviewStatuses.has(String(value ?? "").toLowerCase()),
  );
}

function valueOrFallback(value: unknown) {
  return typeof value === "string" && value.trim() ? value : "Not provided";
}

function locationValue(challenge: ChallengeRow) {
  if (challenge.district || challenge.block_ward || challenge.block) {
    return [challenge.district, challenge.block_ward ?? challenge.block].filter(Boolean).join(", ");
  }
  return valueOrFallback(challenge.location);
}

function GovReview() {
  const [challenges, setChallenges] = useState<ChallengeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadChallenges = async () => {
      const { data, error: queryError } = await supabase
        .from("challenges")
        .select("*")
        .order("created_at", { ascending: false });
      if (!active) return;
      if (queryError) setError(queryError.message);
      else setChallenges(((data ?? []) as ChallengeRow[]).filter(needsReview));
      setLoading(false);
    };
    void loadChallenges();
    return () => {
      active = false;
    };
  }, []);

  return (
    <AppLayout
      role="gov"
      title="Challenge Review Queue"
      subtitle="Review AI-analyzed citizen reports before they become available for university solutions."
    >
      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">Loading challenges...</p>
      ) : challenges.length === 0 ? (
        <EmptyState
          title="No challenges need review"
          description="New AI-analyzed citizen reports will appear here."
          icon={Inbox}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {challenges.map((challenge) => (
                  <TableRow key={String(challenge.id)}>
                    <TableCell className="max-w-sm font-medium">
                      {valueOrFallback(challenge.title)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {locationValue(challenge)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {valueOrFallback(challenge.category ?? challenge.ai_category)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {valueOrFallback(challenge.priority ?? challenge.ai_priority)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to="/gov/challenge/$id" params={{ id: String(challenge.id) }}>
                          Review
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
