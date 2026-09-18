import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, ClipboardList, Compass } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { RoleGuard } from "@/components/RoleGuard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/university/dashboard")({
  head: () => ({
    meta: [
      { title: "University Dashboard — SICP Jharkhand" },
      {
        name: "description",
        content: "Explore civic challenges and submit solutions that can make an impact.",
      },
      { property: "og:title", content: "University Dashboard — SICP Jharkhand" },
      {
        property: "og:description",
        content: "Explore civic challenges and submit solutions that can make an impact.",
      },
    ],
  }),
  component: UniversityDashboardRoute,
});

function proposalField(proposal: string, label: string) {
  const match = proposal.match(new RegExp(`^${label}:\\s*(.+)$`, "im"));
  return match?.[1]?.trim() ?? "Not provided";
}

function historyStatus(solution: Record<string, unknown>, bid?: Record<string, unknown>) {
  const bidStatus = String(bid?.status ?? "").toLowerCase();
  if (["completed", "verified", "released"].includes(bidStatus)) return "Completed";
  if (bidStatus === "submitted_for_verification") return "Awaiting Verification";
  if (bidStatus === "funded") return "Project Funded";
  const solutionStatus = String(solution.status ?? "").toLowerCase();
  if (["government_approved", "approved", "accepted"].includes(solutionStatus)) {
    return "Selected";
  }
  if (["rejected", "not_selected"].includes(solutionStatus)) return "Not Selected";
  return "Proposal Submitted";
}

function challengeLocation(challenge: Record<string, unknown>) {
  const location = [challenge.district, challenge.block_ward ?? challenge.block]
    .filter(Boolean)
    .join(", ");
  const coordinates =
    challenge.latitude != null && challenge.longitude != null
      ? ` (${String(challenge.latitude)}, ${String(challenge.longitude)})`
      : "";
  return `${location || "Location not provided"}${coordinates}`;
}

function UniversityDashboardRoute() {
  return (
    <RoleGuard role="university">
      <UniversityWorkspace view="overview" />
    </RoleGuard>
  );
}

export type UniversityView = "overview" | "available" | "proposals" | "projects" | "history";

export function UniversityWorkspace({ view }: { view: UniversityView }) {
  const [name, setName] = useState("University user");
  const [challenges, setChallenges] = useState<Record<string, unknown>[]>([]);
  const [proposals, setProposals] = useState<Record<string, unknown>[]>([]);
  const [projects, setProjects] = useState<Record<string, unknown>[]>([]);
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        if (active) {
          setError("Please log in to view the university dashboard.");
          setLoading(false);
        }
        return;
      }

      const [{ data: profile }, challengeResult, solutionResult] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
        supabase.from("challenges").select("*").order("created_at", { ascending: false }),
        supabase
          .from("university_solutions")
          .select("*")
          .eq("university_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (!active) return;
      if (profile?.full_name) setName(profile.full_name.trim());
      const queryError = challengeResult.error || solutionResult.error;
      if (queryError) {
        setError(queryError.message);
      } else {
        const approvedStatuses = new Set(["approved", "government_approved"]);
        const openStatuses = new Set(["open", "published", "open_for_university_solutions"]);
        const unavailableStatuses = new Set([
          "submitted",
          "pending",
          "pending_review",
          "rejected",
          "solved",
          "completed",
          "closed",
        ]);
        const solutions = (solutionResult.data ?? []) as Record<string, unknown>[];
        const challengeTitles = new Map(
          ((challengeResult.data ?? []) as Record<string, unknown>[]).map((challenge) => [
            String(challenge.id),
            String(challenge.title ?? "Challenge"),
          ]),
        );
        setChallenges(
          ((challengeResult.data ?? []) as Record<string, unknown>[]).filter((challenge) => {
            const statuses = [challenge.status, challenge.triage_status].map((value) =>
              String(value ?? "").toLowerCase(),
            );
            const isUnavailable = statuses.some((status) => unavailableStatuses.has(status));
            const isApprovedOrOpen = statuses.some(
              (status) => approvedStatuses.has(status) || openStatuses.has(status),
            );
            return (
              openStatuses.has(String(challenge.status ?? "").toLowerCase()) ||
              (!isUnavailable && isApprovedOrOpen)
            );
          }),
        );
        setProposals(
          solutions.map((solution) => ({
            ...solution,
            challenge_title: challengeTitles.get(String(solution.challenge_id)) ?? "Challenge",
          })),
        );

        const solutionChallengeIds = [
          ...new Set(solutions.map((solution) => String(solution.challenge_id))),
        ];
        if (solutionChallengeIds.length === 0) {
          setProjects([]);
        } else {
          const { data: projectBids, error: bidsError } = await supabase
            .from("industry_bids")
            .select("challenge_id, proposed_budget, timeline, status, created_at")
            .in("challenge_id", solutionChallengeIds)
            .in("status", [
              "funded",
              "submitted_for_verification",
              "completed",
              "verified",
              "released",
            ]);

          if (bidsError) {
            setError(bidsError.message);
          } else {
            const fundedBudgetByChallenge = new Map(
              ((projectBids ?? []) as Record<string, unknown>[]).map((bid) => [
                String(bid.challenge_id),
                bid.proposed_budget,
              ]),
            );
            const bidByChallenge = new Map(
              ((projectBids ?? []) as Record<string, unknown>[]).map((bid) => [
                String(bid.challenge_id),
                bid,
              ]),
            );
            setProjects(
              solutions
                .filter(
                  (solution) =>
                    ["government_approved", "approved", "accepted"].includes(
                      String(solution.status ?? "").toLowerCase(),
                    ) &&
                    ["funded", "submitted_for_verification"].includes(
                      String(bidByChallenge.get(String(solution.challenge_id))?.status ?? ""),
                    ),
                )
                .map((solution) => ({
                  ...solution,
                  challenge_title:
                    challengeTitles.get(String(solution.challenge_id)) ?? "Challenge",
                  funded_budget: fundedBudgetByChallenge.get(String(solution.challenge_id)),
                  approved_timeline: bidByChallenge.get(String(solution.challenge_id))?.timeline,
                  project_status:
                    bidByChallenge.get(String(solution.challenge_id))?.status ===
                    "submitted_for_verification"
                      ? "Awaiting Verification"
                      : "Funded",
                })),
            );
            setHistory(
              solutions.map((solution) => ({
                ...solution,
                challenge_title: challengeTitles.get(String(solution.challenge_id)) ?? "Challenge",
                challenge: ((challengeResult.data ?? []) as Record<string, unknown>[]).find(
                  (challenge) => String(challenge.id) === String(solution.challenge_id),
                ),
                project_bid: bidByChallenge.get(String(solution.challenge_id)),
              })),
            );
          }
        }
      }
      setLoading(false);
    };

    void loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  return (
    <AppLayout
      role="university"
      title={`Welcome, ${name}`}
      subtitle={
        view === "overview"
          ? "Your university workspace for civic problem solving."
          : view === "available"
            ? "Open civic challenges available for university proposals."
            : view === "proposals"
              ? "Solutions submitted by your university."
              : view === "projects"
                ? "Projects where your university solution was selected."
                : "Previous university proposals and project outcomes."
      }
    >
      {error && (
        <p className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </p>
      )}
      {view === "overview" ? (
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">University overview</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Review open civic challenges, submit proposals, and track selected solutions moving to
            industry execution.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/university/available">Open Civic Challenges</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/university/proposals">My Proposals</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/university/projects">Active Projects</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/university/history">History</Link>
            </Button>
          </div>
        </section>
      ) : loading ? (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      ) : (
        <DashboardSection
          id={
            view === "available"
              ? "available-challenges"
              : view === "proposals"
                ? "my-proposals"
                : view === "projects"
                  ? "active-projects"
                  : "project-history"
          }
          title={
            view === "available"
              ? "Open Civic Challenges"
              : view === "proposals"
                ? "My Proposals"
                : view === "projects"
                  ? "Active Projects"
                  : "Project History"
          }
          icon={
            view === "available"
              ? Compass
              : view === "proposals"
                ? ClipboardList
                : view === "projects"
                  ? BriefcaseBusiness
                  : ClipboardList
          }
          items={
            view === "available"
              ? challenges
              : view === "proposals"
                ? proposals
                : view === "projects"
                  ? projects
                  : history
          }
          empty={
            view === "available"
              ? "No open civic challenges are available right now."
              : view === "proposals"
                ? "You have not submitted any proposals yet."
                : view === "projects"
                  ? "You have no selected active projects yet."
                  : "No proposal history is available yet."
          }
          action={
            view === "available"
              ? "View Challenge"
              : view === "proposals"
                ? "View Proposal"
                : undefined
          }
          challengeLinks={view === "available"}
          proposalItems={view === "proposals"}
          projectItems={view === "projects"}
          historyItems={view === "history"}
        />
      )}
    </AppLayout>
  );
}

function DashboardSection({
  id,
  title,
  icon: Icon,
  items,
  empty,
  action,
  challengeLinks = false,
  proposalItems = false,
  projectItems = false,
  historyItems = false,
}: {
  id: string;
  title: string;
  icon: LucideIcon;
  items: Record<string, unknown>[];
  empty: string;
  action?: string;
  challengeLinks?: boolean;
  proposalItems?: boolean;
  projectItems?: boolean;
  historyItems?: boolean;
}) {
  return (
    <section id={id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      {items.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((item, index) => (
            <div key={String(item.id ?? index)} className="rounded-lg border border-border p-3">
              <p className="font-medium">
                {String(item.title ?? item.name ?? item.challenge_title ?? item.id ?? "")}
              </p>
              {proposalItems && (
                <>
                  <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">
                    {String(item.solution_proposal ?? "Proposal details not provided")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>Status: {String(item.status ?? "Not provided")}</span>
                    <span>Submitted: {String(item.created_at ?? "Date not provided")}</span>
                  </div>
                </>
              )}
              {projectItems && (
                <>
                  <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">
                    {proposalField(String(item.solution_proposal ?? ""), "Solution approach")}
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <p>Approved Budget: {String(item.funded_budget ?? "Not provided")}</p>
                    <p>Approved Timeline: {String(item.approved_timeline ?? "Not provided")}</p>
                    <p className="font-semibold text-success">
                      Status: {String(item.project_status ?? "Funded")}
                    </p>
                  </div>
                </>
              )}
              {historyItems && (
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <p>
                    Location: {challengeLocation((item.challenge as Record<string, unknown>) ?? {})}
                  </p>
                  <p>
                    Proposal status:{" "}
                    {historyStatus(item, item.project_bid as Record<string, unknown> | undefined)}
                  </p>
                  {item.project_bid && (
                    <>
                      <p>
                        Approved Budget:{" "}
                        {String(
                          (item.project_bid as Record<string, unknown>).proposed_budget ??
                            "Not provided",
                        )}
                      </p>
                      <p>
                        Approved Timeline:{" "}
                        {String(
                          (item.project_bid as Record<string, unknown>).timeline ?? "Not provided",
                        )}
                      </p>
                      <p>
                        Project status:{" "}
                        {historyStatus(item, item.project_bid as Record<string, unknown>)}
                      </p>
                    </>
                  )}
                  <p>Submitted: {String(item.created_at ?? "Date not provided")}</p>
                </div>
              )}
              {challengeLinks && (
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{String(item.category ?? "Category not provided")}</span>
                  <span>
                    {item.district || item.block_ward || item.block
                      ? challengeLocation(item)
                      : String(item.location ?? "Location not provided")}
                  </span>
                  <span>{String(item.priority ?? "Priority not provided")}</span>
                </div>
              )}
              {item.description || item.summary ? (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {String(item.description ?? item.summary)}
                </p>
              ) : null}
              {challengeLinks ? (
                <Button asChild variant="link" className="mt-2 h-auto p-0 text-sm">
                  <Link to="/university/challenge/$id" params={{ id: String(item.id) }}>
                    {action}
                    <ArrowRight className="ml-1 size-3.5" />
                  </Link>
                </Button>
              ) : proposalItems ? (
                <Button asChild variant="link" className="mt-2 h-auto p-0 text-sm">
                  <Link to="/university/proposal/$id" params={{ id: String(item.id) }}>
                    {action}
                    <ArrowRight className="ml-1 size-3.5" />
                  </Link>
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
