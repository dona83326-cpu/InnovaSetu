import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/RoleGuard";
import { GovWorkspace } from "./gov.dashboard";

export const Route = createFileRoute("/gov/evaluation")({ component: EvaluationRoute });
function EvaluationRoute() {
  return (
    <RoleGuard role="gov">
      <GovWorkspace view="evaluation" />
    </RoleGuard>
  );
}
