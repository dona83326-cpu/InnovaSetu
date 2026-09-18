import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/RoleGuard";
import { GovWorkspace } from "./gov.dashboard";

export const Route = createFileRoute("/gov/bids")({ component: BidsRoute });
function BidsRoute() {
  return (
    <RoleGuard role="gov">
      <GovWorkspace view="bids" />
    </RoleGuard>
  );
}
