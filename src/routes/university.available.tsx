import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/RoleGuard";
import { UniversityWorkspace } from "./university.dashboard";

export const Route = createFileRoute("/university/available")({
  component: UniversityAvailableRoute,
});

function UniversityAvailableRoute() {
  return (
    <RoleGuard role="university">
      <UniversityWorkspace view="available" />
    </RoleGuard>
  );
}
