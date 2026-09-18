import { cn } from "@/lib/utils";
import type { ChallengeStatus, Priority } from "@/lib/mock-data";

const statusStyles: Record<ChallengeStatus, string> = {
  Submitted: "bg-primary/10 text-primary ring-primary/20",
  Assigned: "bg-accent/15 text-accent ring-accent/25",
  "Accepted by University": "bg-accent/15 text-accent ring-accent/25",
  "In Progress": "bg-warning/15 text-warning-foreground ring-warning/30",
  "Expert Verification Pending": "bg-warning/15 text-warning-foreground ring-warning/30",
  Solved: "bg-success/12 text-success ring-success/25",
};

const priorityStyles: Record<Priority, string> = {
  Low: "bg-muted text-muted-foreground ring-border",
  Medium: "bg-primary/10 text-primary ring-primary/20",
  High: "bg-accent/15 text-accent ring-accent/25",
  Critical: "bg-destructive/12 text-destructive ring-destructive/25",
};

export function StatusBadge({
  status,
  className,
}: {
  status: ChallengeStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap",
        statusStyles[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        priorityStyles[priority],
      )}
    >
      {priority}
    </span>
  );
}
