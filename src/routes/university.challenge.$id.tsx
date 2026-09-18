import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, BrainCircuit, MapPin, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/university/challenge/$id")({
  head: () => ({
    meta: [
      { title: "Challenge Details — SICP Jharkhand" },
      {
        name: "description",
        content: "Review an approved civic challenge and propose a solution.",
      },
      { property: "og:title", content: "Challenge Details — SICP Jharkhand" },
      {
        property: "og:description",
        content: "Review an approved civic challenge and propose a solution.",
      },
    ],
  }),
  component: UniversityChallenge,
});

type Challenge = Record<string, unknown>;

function displayValue(value: unknown, fallback = "Not provided") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function locationValue(challenge: Challenge) {
  if (challenge.district || challenge.block_ward || challenge.block) {
    const location = [challenge.district, challenge.block_ward ?? challenge.block]
      .filter(Boolean)
      .join(", ");
    return challenge.latitude != null && challenge.longitude != null
      ? `${location} (${String(challenge.latitude)}, ${String(challenge.longitude)})`
      : location;
  }
  return displayValue(challenge.location);
}

function UniversityChallenge() {
  const { id } = useParams({ from: "/university/challenge/$id" });
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [solution, setSolution] = useState("");
  const [mentorName, setMentorName] = useState("");
  const [students, setStudents] = useState([{ name: "", email: "" }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const loadChallenge = async () => {
      const { data, error: queryError } = await supabase
        .from("challenges")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!active) return;
      if (queryError) setError(queryError.message);
      else setChallenge((data as Challenge | null) ?? null);
      setLoading(false);
    };
    void loadChallenge();
    return () => {
      active = false;
    };
  }, [id]);

  const submitProposal = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (
      !solution.trim() ||
      !mentorName.trim() ||
      students.length === 0 ||
      students.some((student) => !student.name.trim() || !student.email.trim())
    ) {
      toast.error("Complete all proposal fields before submitting.");
      return;
    }

    setSubmitting(true);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error(userError?.message ?? "Please log in to submit a proposal.");
      setSubmitting(false);
      return;
    }

    const studentNameList = students.map(
      (student) => `${student.name.trim()} <${student.email.trim()}>`,
    );
    
    // Step 1: Insert the university solution
    const { error: insertError } = await supabase.from("university_solutions").insert({
      challenge_id: id,
      university_id: user.id,
      mentor_name: mentorName.trim(),
      student_names: studentNameList,
      solution_proposal: solution.trim(),
      site_visit_verified: false,
      status: "submitted",
    });

    if (insertError) {
      toast.error(insertError.message);
      setSubmitting(false);
      return;
    }

    // Step 2: AUTO-APPROVE - Update challenge status to send directly to Industry
    // This skips the Government review step for simplified demo flow
    const { error: statusError } = await supabase
      .from("challenges")
      .update({ status: "industry_bidding" })
      .eq("id", id);

    if (statusError) {
      console.error("Failed to update challenge status:", statusError);
      // Don't fail the whole submission if this fails, just warn
      toast.warning("Proposal submitted but auto-approval had an issue. Check with admin.");
    } else {
      toast.success("Solution submitted and sent directly to Industry for execution!");
    }
    
    await navigate({ to: "/university/proposals" });
    setSubmitting(false);
  };

  if (loading) {
    return (
      <AppLayout role="university" title="Loading challenge">
        <p className="text-sm text-muted-foreground">Loading challenge...</p>
      </AppLayout>
    );
  }

  if (error || !challenge) {
    return (
      <AppLayout role="university" title="Challenge not found">
        <EmptyState
          title={`No challenge with reference ${id}`}
          description={error ?? "This challenge is no longer available."}
          action={
            <Button asChild>
              <Link to="/university/dashboard">Back to dashboard</Link>
            </Button>
          }
        />
      </AppLayout>
    );
  }

  const title = displayValue(challenge.title, "Untitled challenge");
  const category = displayValue(challenge.category ?? challenge.ai_category);
  const priority = displayValue(challenge.priority ?? challenge.ai_priority);
  const location = locationValue(challenge);
  const description = displayValue(challenge.description);
  const reportedDate = displayValue(challenge.created_at ?? challenge.submitted_on);
  const aiCategory = displayValue(challenge.ai_category ?? challenge.category);
  const aiPriority = displayValue(challenge.ai_priority ?? challenge.priority);
  const aiReason = displayValue(
    challenge.ai_reason,
    "The report was triaged from its description and routed to relevant university domains.",
  );
  const relevantDomains = displayValue(challenge.relevant_domains ?? aiCategory);
  const mediaUrls = Array.isArray(challenge.media_urls)
    ? challenge.media_urls.filter((url): url is string => typeof url === "string")
    : [];

  return (
    <AppLayout role="university" title={title} subtitle={`Challenge ${id} · ${location}`}>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/university/dashboard">
          <ArrowLeft className="mr-2 size-4" /> Back to dashboard
        </Link>
      </Button>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {category}
              </span>
              <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                {priority}
              </span>
            </div>
            <h2 className="mt-5 text-lg font-semibold">Description</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>

            <dl className="mt-6 grid gap-4 rounded-lg bg-secondary/60 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Location</dt>
                <dd className="mt-1 flex items-center gap-1.5 font-medium">
                  <MapPin className="size-3.5 text-accent" /> {location}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Reported date</dt>
                <dd className="mt-1 font-medium">{reportedDate}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 font-semibold text-primary">
              <BrainCircuit className="size-5" /> AI Analysis
            </div>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Category</dt>
                <dd className="mt-1 font-medium">{aiCategory}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Priority</dt>
                <dd className="mt-1 font-medium">{aiPriority}</dd>
              </div>
            </dl>
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Relevant Domains
              </p>
              <p className="mt-1 font-medium">{relevantDomains}</p>
            </div>
            <p className="mt-5 rounded-lg bg-secondary/60 p-3 text-sm text-muted-foreground">
              {aiReason}
            </p>
          </section>
          {mediaUrls.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="font-semibold">Citizen photo</h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {mediaUrls.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt="Citizen report"
                    className="h-40 w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="h-fit rounded-xl border border-primary/20 bg-primary/5 p-6 lg:sticky lg:top-6">
          <h2 className="font-semibold">Ready to help solve this challenge?</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Submit the technical solution your university proposes. It will be automatically approved and sent to Industry for execution.
          </p>
          <Button
            size="lg"
            className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => setFormOpen((open) => !open)}
          >
            <Send className="mr-2 size-4" /> Submit Solution Proposal
          </Button>
          {formOpen && (
            <form
              onSubmit={submitProposal}
              className="mt-6 space-y-4 border-t border-primary/20 pt-6"
            >
              <div className="space-y-1.5">
                <Label htmlFor="solution">Proposed solution / approach</Label>
                <Textarea
                  id="solution"
                  rows={5}
                  value={solution}
                  onChange={(event) => setSolution(event.target.value)}
                  placeholder="Describe how your team would address this challenge."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mentor-name">Mentor name</Label>
                <Input
                  id="mentor-name"
                  value={mentorName}
                  onChange={(event) => setMentorName(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Students</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={students.length >= 5}
                    onClick={() => setStudents((current) => [...current, { name: "", email: "" }])}
                  >
                    <Plus className="mr-1.5 size-4" /> Add Student
                  </Button>
                </div>
                <div className="space-y-3">
                  {students.map((student, index) => (
                    <div key={index} className="rounded-lg border border-border p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Student {index + 1}
                        </span>
                        {students.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove student ${index + 1}`}
                            onClick={() =>
                              setStudents((current) => current.filter((_, i) => i !== index))
                            }
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Input
                          aria-label={`Student ${index + 1} Name`}
                          value={student.name}
                          onChange={(event) =>
                            setStudents((current) =>
                              current.map((item, i) =>
                                i === index ? { ...item, name: event.target.value } : item,
                              ),
                            )
                          }
                          placeholder={`Student ${index + 1} Name`}
                        />
                        <Input
                          type="email"
                          aria-label={`Student ${index + 1} Email`}
                          value={student.email}
                          onChange={(event) =>
                            setStudents((current) =>
                              current.map((item, i) =>
                                i === index ? { ...item, email: event.target.value } : item,
                              ),
                            )
                          }
                          placeholder={`Student ${index + 1} Email`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Proposal"}
              </Button>
            </form>
          )}
        </aside>
      </div>
    </AppLayout>
  );
}