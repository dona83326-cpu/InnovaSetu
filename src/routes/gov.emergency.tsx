import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/RoleGuard";
import { GovWorkspace } from "./gov.dashboard";

export const Route = createFileRoute("/gov/emergency")({ component: EmergencyRoute });
function EmergencyRoute() {
  return (
    <RoleGuard role="gov">
      <GovWorkspace view="emergency" />
    </RoleGuard>
  );
}
