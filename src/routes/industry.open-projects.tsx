import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/RoleGuard";
import { IndustryWorkspace } from "./industry.dashboard";

export const Route = createFileRoute("/industry/open-projects")({ component: OpenProjectsRoute });
function OpenProjectsRoute() {
  return (
    <RoleGuard role="industry">
      <IndustryWorkspace view="open-projects" />
    </RoleGuard>
  );
}
