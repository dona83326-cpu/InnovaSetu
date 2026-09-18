import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/RoleGuard";
import { UniversityWorkspace } from "./university.dashboard";

export const Route = createFileRoute("/university/proposals")({
  component: UniversityProposalsRoute,
});

function UniversityProposalsRoute() {
  return (
    <RoleGuard role="university">
      <UniversityWorkspace view="proposals" />
    </RoleGuard>
  );
}
