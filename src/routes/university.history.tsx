import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/RoleGuard";
import { UniversityWorkspace } from "./university.dashboard";

export const Route = createFileRoute("/university/history")({
  component: UniversityHistoryRoute,
});

function UniversityHistoryRoute() {
  return (
    <RoleGuard role="university">
      <UniversityWorkspace view="history" />
    </RoleGuard>
  );
}
