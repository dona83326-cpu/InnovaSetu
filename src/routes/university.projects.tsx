import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/RoleGuard";
import { UniversityWorkspace } from "./university.dashboard";

export const Route = createFileRoute("/university/projects")({
  component: UniversityProjectsRoute,
});

function UniversityProjectsRoute() {
  return (
    <RoleGuard role="university">
      <UniversityWorkspace view="projects" />
    </RoleGuard>
  );
}
